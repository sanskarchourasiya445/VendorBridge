// =============================================================================
// models/Collection.js — generic in-memory data collection.
// Acts as the Model layer: encapsulates all data access & mutation so
// controllers never touch raw arrays directly. Swappable for a real DB later.
// =============================================================================
export default class Collection {
  /**
   * @param {string} name        Logical name (for ids / errors)
   * @param {object[]} seed       Initial records
   * @param {string} idPrefix     Prefix used when generating new ids (e.g. 'VEN')
   */
  constructor(name, seed = [], idPrefix = 'REC') {
    this.name = name;
    this.idPrefix = idPrefix;
    // Defensive clone so mutations never leak back into the seed module.
    this.records = seed.map((r) => ({ ...r }));
    this._seq = this._highestSeq();
    // Optional write-through persistence hook: (op, record, name) => void.
    // Set by config/db.js when a MongoDB connection is available. When null,
    // the collection behaves exactly as before (pure in-memory).
    this._persist = null;
  }

  /** Largest numeric id suffix seen so far, so generated ids never collide. */
  _highestSeq() {
    return this.records.reduce((max, r) => {
      const n = Number(String(r.id || '').split('-').pop());
      return Number.isFinite(n) && n > max ? n : max;
    }, this.records.length);
  }

  /** Replace all in-memory records (used when hydrating from the database). */
  hydrate(records = []) {
    this.records = records.map((r) => ({ ...r }));
    this._seq = this._highestSeq();
    return this;
  }

  /** Register a write-through persistence callback. */
  bindPersistence(fn) {
    this._persist = typeof fn === 'function' ? fn : null;
    return this;
  }

  /** Fire the persistence hook (fire-and-forget; never blocks the request). */
  _emit(op, record) {
    if (!this._persist) return;
    try {
      Promise.resolve(this._persist(op, record, this.name)).catch((err) =>
        // eslint-disable-next-line no-console
        console.error(`[db] persist ${op} on ${this.name} failed:`, err.message)
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`[db] persist ${op} on ${this.name} failed:`, err.message);
    }
  }

  all(filterFn) {
    return filterFn ? this.records.filter(filterFn) : [...this.records];
  }

  findById(id) {
    return this.records.find((r) => r.id === id) || null;
  }

  findOne(predicate) {
    return this.records.find(predicate) || null;
  }

  count(filterFn) {
    return this.all(filterFn).length;
  }

  nextId() {
    this._seq += 1;
    return `${this.idPrefix}-${String(this._seq).padStart(3, '0')}`;
  }

  create(payload) {
    const record = { id: payload.id || this.nextId(), ...payload };
    this.records.push(record);
    this._emit('create', record);
    return { ...record };
  }

  update(id, patch) {
    const idx = this.records.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    this.records[idx] = { ...this.records[idx], ...patch, id };
    this._emit('update', this.records[idx]);
    return { ...this.records[idx] };
  }

  remove(id) {
    const idx = this.records.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    this.records.splice(idx, 1);
    this._emit('remove', { id });
    return true;
  }
}
