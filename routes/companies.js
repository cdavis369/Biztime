const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get("/", async function(req, res, next) {
    try {
        const query = await db.query("SELECT * FROM companies");
        return res.json({companies: query.rows});
    } catch (error) {
        return next(error);
    }
});

router.get("/:code", async function(req, res, next) {
    try {
        const code = req.params.code;
        const query = await db.query("SELECT * FROM companies WHERE code = $1", [code]);
        if (query.rows.length === 0) {
            throw new ExpressError(`Company not found with code ${code}`, 404)
        }
        return res.json({company: query.rows[0]})
    } catch (error) {
        return next(error);
    }
});

router.post("/", async function(req, res, next) {
    try {
        const {code, name, description} = req.body;
        const query = await db.query(
            `INSERT INTO companies (code, name, description)
                VALUES ($1, $2, $3)
                RETURNING code, name, description`,
            [code, name, description]
        );
        return res.json({company: query.rows})
    } catch (error) {
        return next(error);
    }
});

router.put("/:code", async function(req, res, next) {
    const {name, description} = req.body;
    const code = req.params.code;
    try {
        const sql = "UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING *";
        const query = await db.query(sql, [name, description, code]);
        if (query.rows.length === 0) {
            throw new ExpressError(`Company not found with code ${code}`, 404)
        }
        return res.json({company: query.rows[0]})
    } catch (error) {
        return next(error);
    }
});

router.delete("/:code", async function(req, res, next) {
    const code = req.params.code;
    try {
        const query = await db.query("DELETE FROM companies WHERE code=$1 RETURNING code", [code]);
        if (query.rows.length === 0) {
            throw new ExpressError(`Company not found with code ${code}`, 404);
        }
        return res.json({message: `Company ${code} deleted`});
    } catch (error) {
        return next(error);
    }
});

module.exports = router;