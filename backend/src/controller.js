import { Router } from "express";
import * as model from "./model.js";
import { validateTokenMiddleware, validateTokenEndpoint } from "./db.js";

function bonk(req, res, next) {
    res.writeHead(302, {
        location: "https://knowyourmeme.com/photos/1916585-bonk-cheems",
    });
    res.end();
}

function error404(req, res, next) {
    res.status(404);
    res.render("404");
}

function error500(err, req, res, next) {
    console.error(err)
    res.status(500);
    res.render("500");
}

async function get_areas(req, res) {
    const areas = await req.app.locals.provider.getAreas();
    res.json(areas);
}

async function get_courses(req, res) {
    const courses = await req.app.locals.provider.getCourses(req.query.area);
    res.json(courses);
}

async function get_curricula(req, res) {
    const curricula = await req.app.locals.provider.getCurricula(req.query.course);
    res.json(curricula);
}

async function get_teachings(req, res) {
    const teachings = await req.app.locals.provider.getTeachings(req.query.course, req.query.curriculum, parseInt(req.query.year));
    res.json(teachings);
}

async function create_calendar(req, res, next) {
    const course = req.body.course;
    const statsLabel = "unibo"; // FIXME change with uni and course name
    const year = req.body.year;
    const curriculum = req.body.curriculum;
    var lectures = req.body.lectures;
    if (typeof lectures === "undefined" || lectures === "") {
        lectures = [];
    } else if (typeof lectures === "string") {
        lectures = [lectures];
    }
    let id = model.generateCalendar(statsLabel, course, year, curriculum, lectures);
    res.send(id);
}

async function get_ical(req, res, next) {
    const id = req.query.id;
    let alert = req.query.alert === undefined ? null : parseInt(req.query.alert);
    let unibo_cal = await model.getICalendarEvents(req.app.locals.provider, id, req.get("User-Agent"), alert);
    res.type("text/calendar");
    res.send(unibo_cal);
}

async function stats_page(req, res, next) {
    res.render("stats", {
        "page": "stats",
        "timestamp": Date.now()
    });
}

async function get_stats_summary(req, res, next) {
    try {
        // Add security headers and CORS
        res.set({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

        const requestsData = await model.getRequestsDayByDay();
        const enrollmentsData = await model.getNumEnrollmentsDayByDay();
        const activeUsersData = await model.getActiveUsersDayByDay();
        const activeUsersToday = await model.getActiveUsers(new Date());
        const courseData = await model.getNumUsersForCourses();
        const totalEnrollments = await model.getTotalEnrollments();
        const activeEnrollments = await model.getActiveEnrollments();
        const deviceData = await model.getDeviceStats();
        const urlGenerationData = await model.getUrlGenerationByCourseDayByDay();

        res.type("application/json");
        res.send(JSON.stringify({
            requestsDayByDay: requestsData,
            enrollmentsDayByDay: enrollmentsData,
            activeUsersDayByDay: activeUsersData,
            activeUsersToday: activeUsersToday,
            courseData: courseData,
            totalEnrollments: totalEnrollments,
            activeEnrollments: activeEnrollments,
            deviceData: deviceData,
            urlGenerationData: urlGenerationData
        }));
    } catch (error) {
        console.error("Error in get_stats_summary:", error);
        res.status(500).json({ error: "Failed to fetch stats data" });
    }
}

const public_api_router = Router();
public_api_router.get("/areas", get_areas);
public_api_router.get("/courses", get_courses);
public_api_router.get("/curricula", get_curricula);
public_api_router.get("/teachings", get_teachings);
public_api_router.post("/calendar", create_calendar);

export const router = (() => {
    const r = Router();

    // Handle CORS preflight requests
    r.options("/api/stats/summary", (req, res) => {
        res.set({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        });
        res.status(200).end();
    });

    r.options("/api/validate-token", (req, res) => {
        res.set({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        });
        res.status(200).end();
    });

    r.get("/get_ical", get_ical);
    r.get("/stats", stats_page);
    r.get("/api/validate-token", validateTokenEndpoint);
    r.get("/api/stats/summary", validateTokenMiddleware, get_stats_summary);
    r.get("/bonk", bonk);
    r.use("/api", public_api_router);
    r.use(error404); // 404 catch-all handler (middleware)
    r.use(error500); // 500 error handler (middleware)
    return r;
})();
