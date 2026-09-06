export class JSParser {
    values: Map<string, string>;

    constructor(js: string) {
        const regex = /var\s(?<identifier>\S[^\s]*)\s*=\s*(?<value>.*);/g;
        this.values = new Map<string, string>();

        for (const match of js.matchAll(regex)) {
            const identifier = match.groups?.identifier?.trim();
            const value = match.groups?.value;

            if (identifier !== undefined && value !== undefined) {
                this.values.set(identifier, value);
            }
        }
    }

    getRaw(key: string): string | undefined {
        return this.values.get(key);
    }

    get<T>(key: string): T {
        const raw = this.getRaw(key);
        if (raw === undefined) {
            throw new Error(`Cannot parse ${key}: not found`);
        }
        return JSON.parse(raw);
    }
}