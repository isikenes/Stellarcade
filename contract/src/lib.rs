#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Vec};

// Data structure to store player score with username
#[contracttype]
#[derive(Clone)]
pub struct PlayerScore {
    pub player: Address,
    pub username: String,
    pub score: u32,
}

// Storage keys
#[contracttype]
pub enum DataKey {
    Leaderboard,   // Stores vector of top scores
    LastPlayer,    // Stores the last player who submitted
    RewardClaimed, // Tracks if the current top player has claimed
}

#[contract]
pub struct ArcadeRewardContract;

#[contractimpl]
impl ArcadeRewardContract {
    /// Submit a score for a player with username
    /// Saves the score and updates leaderboard
    pub fn submit_score(env: Env, player: Address, username: String, score: u32) {
        // Verify the player is the caller
        player.require_auth();
        
        // Store last player
        env.storage().persistent().set(&DataKey::LastPlayer, &player);
        
        // Get the current top player BEFORE updating leaderboard
        let old_top_player: Option<Address> = Self::get_top_score(env.clone())
            .map(|top_score| top_score.player);
        
        // Get current leaderboard (or create empty one)
        let mut leaderboard: Vec<PlayerScore> = env
            .storage()
            .persistent()
            .get(&DataKey::Leaderboard)
            .unwrap_or(Vec::new(&env));
        
        // Create new player score entry
        let new_entry = PlayerScore {
            player: player.clone(),
            username: username.clone(),
            score,
        };
        
        // Add new entry to leaderboard
        leaderboard.push_back(new_entry);
        
        // Sort leaderboard by score (descending) - bubble sort for simplicity
        let len = leaderboard.len();
        for i in 0..len {
            for j in 0..(len - i - 1) {
                let curr = leaderboard.get(j).unwrap();
                let next = leaderboard.get(j + 1).unwrap();
                if curr.score < next.score {
                    // Swap
                    let temp = curr.clone();
                    leaderboard.set(j, next);
                    leaderboard.set(j + 1, temp);
                }
            }
        }
        
        // Keep only top 10
        if leaderboard.len() > 10 {
            let mut top_10 = Vec::new(&env);
            for i in 0..10 {
                top_10.push_back(leaderboard.get(i).unwrap());
            }
            leaderboard = top_10;
        }
        
        // Save updated leaderboard
        env.storage().persistent().set(&DataKey::Leaderboard, &leaderboard);
        
        // Reset reward claimed flag ONLY if the #1 player changed
        if !leaderboard.is_empty() {
            let new_top_player = leaderboard.get(0).unwrap().player;
            
            // Check if the top player is different from before
            match old_top_player {
                Some(old_player) => {
                    // If the top player changed, reset the claim flag
                    if old_player != new_top_player {
                        env.storage().persistent().remove(&DataKey::RewardClaimed);
                    }
                    // If same player is still #1, keep the claim flag as-is
                }
                None => {
                    // First entry ever, no need to reset claim flag
                }
            }
        }
    }

    /// Get the full leaderboard (top 10 players)
    pub fn get_leaderboard(env: Env) -> Vec<PlayerScore> {
        env.storage()
            .persistent()
            .get(&DataKey::Leaderboard)
            .unwrap_or(Vec::new(&env))
    }

    /// Get the top score and the player who achieved it
    pub fn get_top_score(env: Env) -> Option<PlayerScore> {
        let leaderboard: Vec<PlayerScore> = env
            .storage()
            .persistent()
            .get(&DataKey::Leaderboard)
            .unwrap_or(Vec::new(&env));
        
        if leaderboard.is_empty() {
            None
        } else {
            Some(leaderboard.get(0).unwrap())
        }
    }

    /// Get the last player who submitted a score
    pub fn get_last_player(env: Env) -> Option<Address> {
        env.storage().persistent().get(&DataKey::LastPlayer)
    }

    /// Claim reward (marks reward as claimed)
    /// In production, this would transfer 1 XLM to the winner
    /// For now, it tracks that the reward was claimed to prevent double-claiming
    pub fn claim_reward(env: Env, player: Address) -> bool {
        player.require_auth();
        
        // Check if reward was already claimed
        let already_claimed: bool = env
            .storage()
            .persistent()
            .get(&DataKey::RewardClaimed)
            .unwrap_or(false);
        
        if already_claimed {
            return false; // Already claimed
        }
        
        // Check if player has the top score
        let top_score: Option<PlayerScore> = Self::get_top_score(env.clone());
        
        match top_score {
            Some(top) => {
                if top.player == player {
                    // Mark reward as claimed
                    env.storage().persistent().set(&DataKey::RewardClaimed, &true);
                    
                    // In production, this would transfer 1 XLM (10_000_000 stroops)
                    // using env.token().transfer() or similar
                    // Example: env.token().transfer(&contract_address, &player, &10_000_000);
                    
                    return true;
                }
                false
            }
            None => false,
        }
    }
    
    /// Check if the current top player has claimed their reward
    pub fn has_claimed_reward(env: Env) -> bool {
        env.storage()
            .persistent()
            .get(&DataKey::RewardClaimed)
            .unwrap_or(false)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env, String};

    #[test]
    fn test_submit_and_get_score() {
        let env = Env::default();
        let contract_id = env.register_contract(None, ArcadeRewardContract);
        let client = ArcadeRewardContractClient::new(&env, &contract_id);

        let player1 = Address::generate(&env);
        let player2 = Address::generate(&env);

        // Submit first score
        env.mock_all_auths();
        client.submit_score(&player1, &String::from_str(&env, "Alice"), &100);

        // Check top score
        let top = client.get_top_score().unwrap();
        assert_eq!(top.score, 100);
        assert_eq!(top.player, player1);

        // Submit higher score
        client.submit_score(&player2, &String::from_str(&env, "Bob"), &200);
        let top = client.get_top_score().unwrap();
        assert_eq!(top.score, 200);
        assert_eq!(top.player, player2);

        // Check last player
        let last = client.get_last_player().unwrap();
        assert_eq!(last, player2);
        
        // Check leaderboard
        let leaderboard = client.get_leaderboard();
        assert_eq!(leaderboard.len(), 2);
        assert_eq!(leaderboard.get(0).unwrap().score, 200); // Highest first
    }

    #[test]
    fn test_claim_reward() {
        let env = Env::default();
        let contract_id = env.register_contract(None, ArcadeRewardContract);
        let client = ArcadeRewardContractClient::new(&env, &contract_id);

        let player = Address::generate(&env);

        env.mock_all_auths();
        client.submit_score(&player, &String::from_str(&env, "Winner"), &100);

        // Top player should be able to claim
        let can_claim = client.claim_reward(&player);
        assert_eq!(can_claim, true);
    }
}
