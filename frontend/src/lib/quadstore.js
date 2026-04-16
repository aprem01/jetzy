/**
 * Jetzy QuadStore — SPOC (Subject-Predicate-Object-Context) Knowledge Graph
 *
 * Adapted from the 3-Tiered Graph RAG architecture.
 * Each fact is a quad: [subject, predicate, object, context]
 * Four-way indexed for constant-time lookups on any dimension.
 */

export class QuadStore {
  constructor() {
    // String → integer ID mapping for memory efficiency
    this.stringToId = new Map();
    this.idToString = new Map();
    this.nextId = 0;

    // Four-way indices for constant-time lookups
    this.spoc = new Map(); // subject → predicate → object → context[]
    this.pocs = new Map(); // predicate → object → context → subject[]
    this.ocsp = new Map(); // object → context → subject → predicate[]
    this.cspo = new Map(); // context → subject → predicate → object[]

    // Flat list for full scans
    this.quads = [];
  }

  _getId(str) {
    const lower = str.toLowerCase().trim();
    if (this.stringToId.has(lower)) return this.stringToId.get(lower);
    const id = this.nextId++;
    this.stringToId.set(lower, id);
    this.idToString.set(id, lower);
    return id;
  }

  _getStr(id) {
    return this.idToString.get(id) || '';
  }

  _setNested(map, keys, value) {
    let current = map;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current.has(keys[i])) current.set(keys[i], new Map());
      current = current.get(keys[i]);
    }
    const lastKey = keys[keys.length - 1];
    if (!current.has(lastKey)) current.set(lastKey, new Set());
    current.get(lastKey).add(value);
  }

  _getNested(map, keys) {
    let current = map;
    for (const key of keys) {
      if (!current || !current.has(key)) return new Set();
      current = current.get(key);
    }
    return current instanceof Set ? current : new Set();
  }

  /**
   * Add a fact to the graph
   * @param {string} subject - Entity being described (e.g., "El Chaltén")
   * @param {string} predicate - Relationship (e.g., "has_trail")
   * @param {string} object - Target value (e.g., "Laguna de los Tres")
   * @param {string} context - Metadata (e.g., "member:u1:2026-02")
   */
  add(subject, predicate, object, context = 'default') {
    const s = this._getId(subject);
    const p = this._getId(predicate);
    const o = this._getId(object);
    const c = this._getId(context);

    // Check for duplicate
    const existing = this.quads.find(q => q[0] === s && q[1] === p && q[2] === o && q[3] === c);
    if (existing) return;

    this.quads.push([s, p, o, c]);

    this._setNested(this.spoc, [s, p, o], c);
    this._setNested(this.pocs, [p, o, c], s);
    this._setNested(this.ocsp, [o, c, s], p);
    this._setNested(this.cspo, [c, s, p], o);
  }

  /**
   * Query facts by any combination of SPOC dimensions
   * @returns {Array<{subject, predicate, object, context}>}
   */
  query({ subject, predicate, object, context } = {}) {
    const results = [];

    // If we have a subject, use the spoc index
    if (subject) {
      const sId = this.stringToId.get(subject.toLowerCase().trim());
      if (sId === undefined) return results;

      for (const quad of this.quads) {
        if (quad[0] !== sId) continue;
        if (predicate && quad[1] !== this.stringToId.get(predicate.toLowerCase().trim())) continue;
        if (object && quad[2] !== this.stringToId.get(object.toLowerCase().trim())) continue;
        if (context && quad[3] !== this.stringToId.get(context.toLowerCase().trim())) continue;
        results.push({
          subject: this._getStr(quad[0]),
          predicate: this._getStr(quad[1]),
          object: this._getStr(quad[2]),
          context: this._getStr(quad[3]),
        });
      }
      return results;
    }

    // If we have an object, scan for it
    if (object) {
      const oId = this.stringToId.get(object.toLowerCase().trim());
      if (oId === undefined) return results;

      for (const quad of this.quads) {
        if (quad[2] !== oId) continue;
        if (predicate && quad[1] !== this.stringToId.get(predicate.toLowerCase().trim())) continue;
        if (context && quad[3] !== this.stringToId.get(context.toLowerCase().trim())) continue;
        results.push({
          subject: this._getStr(quad[0]),
          predicate: this._getStr(quad[1]),
          object: this._getStr(quad[2]),
          context: this._getStr(quad[3]),
        });
      }
      return results;
    }

    // Full scan with filters
    for (const quad of this.quads) {
      if (predicate && quad[1] !== this.stringToId.get(predicate.toLowerCase().trim())) continue;
      if (context && quad[3] !== this.stringToId.get(context.toLowerCase().trim())) continue;
      results.push({
        subject: this._getStr(quad[0]),
        predicate: this._getStr(quad[1]),
        object: this._getStr(quad[2]),
        context: this._getStr(quad[3]),
      });
    }
    return results;
  }

  /**
   * Get all facts about an entity (as subject or object)
   */
  getEntityFacts(entity) {
    const asSubject = this.query({ subject: entity });
    const asObject = this.query({ object: entity });
    return [...asSubject, ...asObject];
  }

  /**
   * Get all unique entities in the graph
   */
  getEntities() {
    const entities = new Set();
    for (const quad of this.quads) {
      entities.add(this._getStr(quad[0]));
      entities.add(this._getStr(quad[2]));
    }
    return [...entities];
  }

  /**
   * Serialize to JSON for persistence
   */
  toJSON() {
    return this.quads.map(q => ({
      s: this._getStr(q[0]),
      p: this._getStr(q[1]),
      o: this._getStr(q[2]),
      c: this._getStr(q[3]),
    }));
  }

  /**
   * Stats
   */
  get size() {
    return this.quads.length;
  }
}
