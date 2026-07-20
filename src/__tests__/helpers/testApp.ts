import { Express } from 'express';
import { createApp } from '../../app.js';

export const createTestApp = (): Express => createApp();
