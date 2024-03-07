// db.ts
import Dexie, { Table } from 'dexie';

export interface GameData {
  id?: number;
  voiceAudio: string;
}

export class MySubClassedDexie extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  data!: Table<GameData>;

  constructor() {
    super('/idbfs');
    this.version(1).stores({
      data: '++id, voiceAudio' // Primary key and indexed props
    });
  }
}

export const indexeddb = new MySubClassedDexie();