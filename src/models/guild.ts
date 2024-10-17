import { model, Schema } from 'mongoose';
import { IGuild } from '../utils';

const schema = new Schema({
    _id: { type: String, required: true },
    isCheckEnabled: { type: Boolean, default: false },
    checkChannel: { type: String, default: null },
    staffRole: { type: String, default: null },
    checkInterval: { type: Number, default: 0 }, // in milliseconds
    checkTimeout: { type: Number, default: 0 }, // in milliseconds
    lastCheck: { type: Number, default: 0 }, // Date.now()
    activeStaff: { type: Array, default: [] }
});

export default model<IGuild>('guilds', schema);