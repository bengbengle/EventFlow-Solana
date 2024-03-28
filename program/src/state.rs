use solana_program::{
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack, Sealed},
    pubkey::Pubkey,
};

use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};

pub struct Quest {
    pub is_initialized: bool,
    pub publisher_pubkey: Pubkey,
    pub quest_ata_pubkey: Pubkey,
}

impl Sealed for Quest {}

impl IsInitialized for Quest {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

impl Pack for Quest {
    
    const LEN: usize = 65;

    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {

        let src = array_ref![src, 0, Quest::LEN];

        let (
            is_initialized, 
            publisher_pubkey, 
            quest_ata_pubkey
        ) = array_refs![src, 1, 32, 32];

        let is_initialized = match is_initialized {
            [0] => false,
            [1] => true,
            _ => return Err(ProgramError::InvalidAccountData),
        };

        Ok(Quest {
            is_initialized,
            publisher_pubkey: Pubkey::new_from_array(*publisher_pubkey),
            quest_ata_pubkey: Pubkey::new_from_array(*quest_ata_pubkey),
        })
    }

    fn pack_into_slice(&self, dst: &mut [u8]) {
        
        let Quest {
            is_initialized,
            publisher_pubkey,
            quest_ata_pubkey,
        } = self;

        let dst = array_mut_ref![dst, 0, Quest::LEN];
        let (
            is_initialized_dst,
            publisher_pubkey_dst,
            quest_ata_pubkey_dst,
        ) = mut_array_refs![dst, 1, 32, 32];


        is_initialized_dst[0] = *is_initialized as u8;
        publisher_pubkey_dst.copy_from_slice(publisher_pubkey.as_ref());
        quest_ata_pubkey_dst.copy_from_slice(quest_ata_pubkey.as_ref());
    }
}
