import type { IGameData } from "$lib/classes/gameData/IGameData";

export class GameData implements IGameData {
    private readonly _id: string;
    private readonly _gameId: string;

    public constructor(id: string, gameId: string) {
        this._id = id;
        this._gameId = gameId;
    }

    public get gameId(): string {
        return this._gameId;
    }

    public get id(): string {
        return this._id;
    }
}