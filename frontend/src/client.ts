import type { Area, Course } from "beecal-common";

export class BeeCalClient {
    getAreas(): Promise<Area[]> {
        return fetch("/api/areas").then(x => x.json());
    }

    getCourses(areaId: string): Promise<Course[]> {
        return fetch("/api/courses?area=" + encodeURIComponent(areaId)).then(x => x.json());
    }
}