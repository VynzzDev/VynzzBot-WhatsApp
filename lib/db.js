/**
 * Functions created by AhmadAmin
 * 
 * © Ahmadamin
 */

const { JsonDB, Config } = require("node-json-db");

const db = new JsonDB(new Config("./db", true, false, "/", true));

/**
 * Push Database.
 * @param {db} database database must JsonDB.
 * @param {*} value value to set database.
 */
async function setDb(database = db, value) {
  await database.push("/", [value], false);
}

/**
 * Get Value Database.
 * @param {db} database database must JsonDB.
 * @param {string} searchProperty search property to get value.
 * @param {string | number | boolean} searchValue search value to get value.
 * @param {string} property property to get value.
 * @returns
 */
async function getDb(database = db, searchProperty = "", searchValue = "", property = "") {
  const index = await database.getIndex("/", searchValue, searchProperty);
  if (index === -1) return new Error("property not found.");
  return await database.getData(`/${index}/${property}`);
}

/**
 * Change The Value The Database.
 * @param {db} database database must JsonDB.
 * @param {string} searchProperty search the property.
 * @param {string | number | boolean} searchValue search the value.
 * @param {*} newValue change value.
 * @param {string} propery the property new value (optional).
 */
async function chDb(database = db, searchProperty = "", searchValue = "", newValue, property = "") {
  const index = await database.getIndex("/", searchValue, searchProperty);
  await database.push(`/${index}/${property === "" ? searchProperty : property}`, newValue);
}

module.exports = { setDb, getDb, chDb };