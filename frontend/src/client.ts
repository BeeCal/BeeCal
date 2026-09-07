import type { Area } from "beecal-common";

export class BeeCalClient {
    getAreas(): Promise<Area[]> {
        return fetch("/api/areas").then(x => x.json());
    }
}