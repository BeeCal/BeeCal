import { Area, Course, Curriculum, Lesson, Teaching, TimetableProvider } from "beecal-common/dist";
import fs from "node:fs/promises";
import os from "node:os";
import fs_stream from "node:fs";
import csv from "csv-parser";
import * as cheerio from "cheerio";
import { Schedule, Task } from "beecal-common/dist/scheduling";

const OPENDATA_DIR = `${os.tmpdir()}/beecal-unibo`;
const OPENDATA_FILE = `${OPENDATA_DIR}/corsi.csv`;
const OPENDATA_VERSION = `${OPENDATA_DIR}/info`;

const LANGUAGE: Map<string, string> = new Map([
    ["magistralecu", "orario-lezioni"],
    ["magistrale", "orario-lezioni"],
    ["laurea", "orario-lezioni"],
    ["singlecycle", "timetable"],
    ["1cycle", "timetable"],
    ["2cycle", "timetable"],
]);

export class UniboProvider implements TimetableProvider {
    institutionName: string = "Alma Mater Studiorum - Università di Bologna";
    country: string = "it";
    license: string = "CC-BY-3.0-IT";

    async #fetchOpenData() {
        console.log("Updating Unibo open data in " + OPENDATA_FILE)
        // Ensure open data dir presence
        await fs.mkdir(OPENDATA_DIR, { recursive: true });
        let response = await fetch("https://dati.unibo.it/api/3/action/package_show?id=degree-programmes").then(x => x.json());
        let datasets = response.result.resources;
        let current = datasets[0];
        let currentVersion = `${current.id}|${current.revision_id}|${current.last_modified}`;
        let savedVersion = await fs.readFile(OPENDATA_VERSION, { encoding: "utf-8" }).catch(() => "")
        if (savedVersion != currentVersion) {
            console.log("Fetching new Unibo Open Data version");
            let data = await fetch(current.url).then(x => x.text());
            await fs.writeFile(OPENDATA_FILE, data);
            await fs.writeFile(OPENDATA_VERSION, currentVersion);
        } else {
            console.log("No Unibo Open Data update needed");
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
        const results: {
            ambiti: string,
            corso_codice: string,
            url: string,
            durata: string,
            tipologia: string,
            corso_descrizione: string,
        }[] = [];
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
                                name: results[i].corso_descrizione,
                                duration: parseInt(results[i].durata),
                                type: results[i].tipologia
                            });
                        }
                    }
                    res(courses);
                });
        });
    }

    // Finding "SITO DEL CORSO" from https://www.unibo.it/it/didattica/corsi-di-studio/corso/[year]/[code]
    #getTimetableUrlGivenUniboUrl(unibo_url: string): Promise<string | undefined> {
        return fetch(unibo_url).then(x => x.text())
            .then(function (html) {
                var $ = cheerio.load(html);
                var timetable_url = $(".social-contact ul li ul li p a").first().attr("href");
                return timetable_url;
            })
            .catch(function (err) {
                console.log(err);
                return undefined;
            });
    }

    async getCurricula(courseId: string): Promise<Curriculum[]> {
        const timetable_url = await this.#getTimetableUrlGivenUniboUrl(courseId.split('§')[1]);
        if (timetable_url === undefined) {
            return [];
        }
        var type = timetable_url.split("/")[3];
        var curricula_url = timetable_url + "/" + LANGUAGE.get(type) + "/@@available_curricula";
        // console.log(curricula_url);
        // ex. https://corsi.unibo.it/laurea/clei/orario-lezioni/@@available_curricula
        const raw: { value: string, label: string }[] = await fetch(curricula_url).then(x => x.json())
            .catch(function (err) {
                console.log(err);
                return [];
            });
        return raw.map(x => { return { id: x.value, name: x.label } });
    }

    async getTeachings(courseId: string, curriculum: string, year: number): Promise<Teaching[]> {
        let unibo_url = courseId.split('§')[1];
        let timetable_url = await this.#getTimetableUrlGivenUniboUrl(unibo_url);
        if (timetable_url === undefined) {
            return [];
        }
        var type = timetable_url.split("/")[3];
        var link = timetable_url + "/" + LANGUAGE.get(type) + "?anno=" + year + "&curricula=" + curriculum;
        return fetch(link).then(x => x.text())
            .then(function (html) {
                var $ = cheerio.load(html);
                var inputs: string[] = [];
                $("#insegnamenti-popup ul li input").each(function (_index, element) {
                    inputs.push($(element).attr("value") || "");
                });
                var labels: string[] = [];
                $("#insegnamenti-popup ul li label").each(function (_index, element) {
                    labels.push($(element).text() || "");
                });
                return inputs.map((x, i) => { return { id: x, name: labels[i] } });
            })
    }

    async getLessons(courseId: string, curriculum: string, year: number, teachingIDsFilter?: Set<string>): Promise<Lesson[]> {
        let unibo_url = courseId.split('§')[1];
        let timetable_pieces = (await this.#getTimetableUrlGivenUniboUrl(unibo_url) || "").split('/');
        if (timetable_pieces.length < 5) {
            return [];
        }
        var type = timetable_pieces[3];
        var course = timetable_pieces[4];
        var root = "https://corsi.unibo.it";
        var link = [root, type, course, LANGUAGE.get(type), '@@orario_reale_json?anno=' + year].join("/");
        link += "&curricula=" + curriculum;
        /*for (var i = 0; i < lectures.length; i++) {
            link += "&insegnamenti=" + lectures[i]["lecture_id"];
        }*/
        link += "&calendar_view=";

        let json = await fetch(link).then(x => x.json());

        let calendar: Lesson[] = [];
        for (var l of json) {
            if (teachingIDsFilter !== undefined && !(teachingIDsFilter.has(l.extCode.split('|')[0]) || teachingIDsFilter.has(l.extCode))) {
                continue;
            }
            const start = new Date(l.start);
            const end = new Date(l.end);
            var location = undefined;
            if (l.aule && Array.isArray(l.aule) && l.aule.length > 0) {
                location = l.aule[0].des_risorsa + ", " + l.aule[0].des_indirizzo;
            }
            var url = undefined;
            if (!(l.teams === undefined) && !(l.teams === null)) {
                url = encodeURI(l.teams);
            }
            var prof = null;
            if (!(l.docente === undefined) && !(l.docente === null)) {
                prof = l.docente;
            }
            calendar.push({
                title: l.title,
                start,
                end,
                location,
                url,
                teacher: prof === null ? undefined : { name: prof as string, email: prof.toLowerCase().replace(/\s/g, ".") + "@unibo.it" }
            });
        }
        if (calendar.length == 0) {
            console.error(`The calendar at ${link} was empty!`);
        }
        return calendar
    }

    getTasks(): Task[] {
        return [{
            schedule: Schedule.Weekly,
            task: () => {
                console.log("Starting Unibo opendata update");
                return this.#fetchOpenData();
            },
        }]
    }
}