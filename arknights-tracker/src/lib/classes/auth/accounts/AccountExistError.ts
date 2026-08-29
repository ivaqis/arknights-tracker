export class AccountExistError extends Error {
    public constructor(message: string) {
        super(message);
    }
}