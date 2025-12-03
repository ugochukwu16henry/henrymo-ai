/**
 * Street Validators
 * Zod schemas for street-related requests
 */

const { z } = require('zod');

const createStreetSchema = z.object({
  cityId: z.string().uuid().nullable().optional(),
  stateId: z.string().uuid().nullable().optional(),
  countryId: z.string().uuid(),
  name: z.string().min(1).max(500),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  fullAddress: z.string().max(1000).optional().nullable(),
});

const updateStreetSchema = z.object({
  name: z.string().min(1).max(500).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  fullAddress: z.string().max(1000).optional().nullable(),
  cityId: z.string().uuid().nullable().optional(),
  stateId: z.string().uuid().nullable().optional(),
  countryId: z.string().uuid().optional(),
});

const searchStreetsSchema = z.object({
  query: z.string().optional(),
  countryId: z.string().uuid().optional(),
  stateId: z.string().uuid().optional(),
  cityId: z.string().uuid().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  radius: z.number().positive().optional(), // in kilometers
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
});

module.exports = {
  createStreetSchema,
  updateStreetSchema,
  searchStreetsSchema,
};

