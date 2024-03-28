use solana_program::program_error::ProgramError;
use std::convert::TryInto;

use crate::error::QuestError::InvalidInstruction;

pub enum QuestInstruction {
    
    QuestCreate {
        amount: u64,
    },
    
    QuestClaim {
        amount: u64,
    },
}

impl QuestInstruction {

    /// Unpacks a byte buffer into a [QuestInstruction](enum.QuestInstruction.html).
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {

        // [ix_enum, amount]
        let (tag, rest) = input.split_first().ok_or(InvalidInstruction)?;

        Ok(match tag {

            0 => Self::QuestCreate {
                amount: Self::_unpack_amount(rest)?,
            },
            
            1 => Self::QuestClaim {
                amount: Self::_unpack_amount(rest)?,
            },

            _ => return Err(InvalidInstruction.into()),
        })
    }

    fn _unpack_amount(input: &[u8]) -> Result<u64, ProgramError> {
        let amount = input
            .get(..8)
            .and_then(|slice| slice.try_into().ok())
            .map(u64::from_le_bytes)
            .ok_or(InvalidInstruction)?;
        Ok(amount)
    }

}
