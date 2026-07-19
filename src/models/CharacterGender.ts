export enum CharacterGender {
    MALE = 1,
    FEMALE = 2
}

export namespace CharacterGender {
    export function isCharacterGender(n: number): n is CharacterGender {
        return n === 1 || n === 2;
    }

    export function get(n: number): CharacterGender | null {
        switch (n) {
            case CharacterGender.MALE: return CharacterGender.MALE;
            case CharacterGender.FEMALE: return CharacterGender.FEMALE;
            default: return null;
        }
    }

    export function getEndminCharId(gender: CharacterGender) {
        switch (gender) {
            case CharacterGender.MALE: return "chr_0002_endminm";
            case CharacterGender.FEMALE: return "chr_0003_endminf";
        }
    }
}