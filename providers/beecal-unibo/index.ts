import { Area, Course, TimetableProvider } from "beecal-common/dist";
import temporaryDirectory from "temp-dir";
import fs from "node:fs/promises";
import fs_stream from "node:fs";
import csv from "csv-parser";

const OPENDATA_DIR = `${temporaryDirectory}/beecal-unibo`;
const OPENDATA_FILE = `${OPENDATA_DIR}/corsi.csv`;
const OPENDATA_VERSION = `${OPENDATA_DIR}/info`;

export class UniboProvider implements TimetableProvider {
    institutionName: string = "Alma Mater Studiorum - Università di Bologna";
    contry: string = "it";
    license: string = "CC-BY-3.0-IT";

    async #fetchOpenData() {
        // Ensure open data dir presence
        await fs.mkdir(OPENDATA_DIR, { recursive: true });
        let response = await fetch("https://dati.unibo.it/api/3/action/package_show?id=degree-programmes").then(x => x.json());
        let datasets = response.result.resources;
        let current = datasets[0];
        let currentVersion = `${current.id}|${current.revision_id}|${current.last_modified}`;
        let savedVersion = await fs.readFile(OPENDATA_VERSION, { encoding: "utf-8" }).catch(() => "")
        if (savedVersion != currentVersion) {
            let data = await fetch(current.url).then(x => x.text());
            await fs.writeFile(OPENDATA_FILE, data);
            await fs.writeFile(OPENDATA_VERSION, currentVersion);
        }
    }

    async getAreas(): Promise<Area[]> {
        const results: string[] = [];
        return new Promise<Area[]>((res, _) => {
            fs_stream.createReadStream(OPENDATA_FILE)
                .pipe(csv())
                .on("data", (data) => {
                    if (data.ambiti != "") {
                        results.push(data.ambiti)
                    }
                })
                .on("end", () => {
                    res(
                        Array.from(new Set(results)).sort()
                            .map((x: string) => { return { id: x, name: x } })
                    );
                });
        });
    }

    getCourses(areaId: string): Promise<Course[]> {
        const results = [];
        return new Promise((res, rej) => {
            fs_stream.createReadStream(OPENDATA_FILE)
                .pipe(csv())
                .on("data", (data) => results.push(data))
                .on("end", () => {
                    const courses: Course[] = []
                    for (let i = 0; i < results.length; i++) {
                        if (results[i].ambiti === areaId) {
                            courses.push({
                                id: `${results[i].corso_codice}§${results[i].url}`,
                                name: results[i].durata,
                                duration: parseInt(results[i].durata),
                                type: results[i].tipologia
                            });
                        }
                    }
                    res(courses);
                });
        });
    }
}