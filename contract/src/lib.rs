#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

// Data structure to store player score
#[contracttype]
#[derive(Clone)]
pub struct PlayerScore {
    pub player: Address,
    pub score: u32,
}

// Storage keys
#[contracttype]
pub enum DataKey {
    TopScore,      // Stores the highest score and player
    LastPlayer,    // Stores the last player who submitted
}

#[contract]
pub struct ArcadeRewardContract;

#[contractimpl]
impl ArcadeRewardContract {
    /// Submit a score for a player
    /// Saves the score and updates top score if higher
    pub fn submit_score(env: Env, player: Address, score: u32) {
        // Verify the player is the caller
        player.require_auth();
        
        // Store last player
        env.storage().persistent().set(&DataKey::LastPlayer, &player);
        
        // Check if we have a top score
        let current_top: Option<PlayerScore> = env.storage().persistent().get(&DataKey::TopScore);
        
        // Update top score if this score is higher or if no top score exists
        match current_top {
            Some(top) => {
                if score > top.score {
                    let new_top = PlayerScore {
                        player: player.clone(),
                        score,
                    };
                    env.storage().persistent().set(&DataKey::TopScore, &new_top);
                }
            }
            None => {
                let new_top = PlayerScore {
                    player: player.clone(),
                    score,
                };
                env.storage().persistent().set(&DataKey::TopScore, &new_top);
            }
        }
    }

    /// Get the top score and the player who achieved it
    /// Returns (score, player_address)
    pub fn get_top_score(env: Env) -> Option<PlayerScore> {
        env.storage().persistent().get(&DataKey::TopScore)
    }

    /// Get the last player who submitted a score
    pub fn get_last_player(env: Env) -> Option<Address> {
        env.storage().persistent().get(&DataKey::LastPlayer)
    }

    /// Claim reward (simple event emitter for now)
    /// In a real scenario, this would transfer tokens
    pub fn claim_reward(env: Env, player: Address) -> bool {
        player.require_auth();
        
        // Check if player has the top score
        let top_score: Option<PlayerScore> = env.storage().persistent().get(&DataKey::TopScore);
        
        match top_score {
            Some(top) => {
                if top.player == player {
                    // In production, this would trigger token transfer
                    // For now, just return true to indicate success
                    return true;
                }
                false
            }
            None => false,
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env};

    #[test]
    fn test_submit_and_get_score() {
        let env = Env::default();
        let contract_id = env.register_contract(None, ArcadeRewardContract);
        let client = ArcadeRewardContractClient::new(&env, &contract_id);

        let player1 = Address::generate(&env);
        let player2 = Address::generate(&env);

        // Submit first score
        env.mock_all_auths();
        client.submit_score(&player1, &100);

        // Check top score
        let top = client.get_top_score().unwrap();
        assert_eq!(top.score, 100);
        assert_eq!(top.player, player1);

        // Submit higher score
        client.submit_score(&player2, &200);
        let top = client.get_top_score().unwrap();
        assert_eq!(top.score, 200);
        assert_eq!(top.player, player2);

        // Check last player
        let last = client.get_last_player().unwrap();
        assert_eq!(last, player2);
    }

    #[test]
    fn test_claim_reward() {
        let env = Env::default();
        let contract_id = env.register_contract(None, ArcadeRewardContract);
        let client = ArcadeRewardContractClient::new(&env, &contract_id);

        let player = Address::generate(&env);

        env.mock_all_auths();
        client.submit_score(&player, &100);

        // Top player should be able to claim
        let can_claim = client.claim_reward(&player);
        assert_eq!(can_claim, true);
    }
}
