import { URLSearchParams } from "node:url";

export abstract class URLRequestParams {
    public getParamString(): string {
        const initParams = this.getInitParams();

        return new URLSearchParams(initParams).toString();
    }

    protected abstract getInitParams(): Record<string, string>
}