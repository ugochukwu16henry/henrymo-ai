/**
 * Streets Routes
 * API endpoints for street management
 */

const express = require('express');
const router = express.Router();
const streetService = require('../services/streetService');
const locationService = require('../services/locationService');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createStreetSchema,
  updateStreetSchema,
  searchStreetsSchema,
} = require('../validators/streetValidators');
const logger = require('../utils/logger');

/**
 * POST /api/content/streets
 * Create a new street
 */
router.post(
  '/',
  authenticate,
  validate({ body: createStreetSchema }),
  async (req, res, next) => {
    try {
      // Verify country exists
      const country = await locationService.getCountryById(req.body.countryId);
      if (!country) {
        return res.status(404).json({
          success: false,
          error: 'Country not found',
        });
      }

      // Verify state if provided
      if (req.body.stateId) {
        const state = await locationService.getStateById(req.body.stateId);
        if (!state) {
          return res.status(404).json({
            success: false,
            error: 'State not found',
          });
        }
      }

      // Verify city if provided
      if (req.body.cityId) {
        const city = await locationService.getCityById(req.body.cityId);
        if (!city) {
          return res.status(404).json({
            success: false,
            error: 'City not found',
          });
        }
      }

      const street = await streetService.createStreet(req.body);

      res.status(201).json({
        success: true,
        data: street,
      });
    } catch (error) {
      logger.error('Error creating street', { error: error.message, userId: req.user?.id });
      next(error);
    }
  }
);

/**
 * GET /api/content/streets
 * Search streets
 */
router.get('/', authenticate, validate({ query: searchStreetsSchema }), async (req, res, next) => {
  try {
    const result = await streetService.searchStreets(req.query);

    res.json({
      success: true,
      data: result.streets,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.offset + result.streets.length < result.total,
      },
    });
  } catch (error) {
    logger.error('Error searching streets', { error: error.message, userId: req.user?.id });
    next(error);
  }
});

/**
 * GET /api/content/streets/:id
 * Get street by ID
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const street = await streetService.getStreetById(req.params.id);

    if (!street) {
      return res.status(404).json({
        success: false,
        error: 'Street not found',
      });
    }

    res.json({
      success: true,
      data: street,
    });
  } catch (error) {
    logger.error('Error fetching street', { error: error.message, id: req.params.id });
    next(error);
  }
});

/**
 * PUT /api/content/streets/:id
 * Update street
 */
router.put(
  '/:id',
  authenticate,
  validate({ body: updateStreetSchema }),
  async (req, res, next) => {
    try {
      // Verify country if provided
      if (req.body.countryId) {
        const country = await locationService.getCountryById(req.body.countryId);
        if (!country) {
          return res.status(404).json({
            success: false,
            error: 'Country not found',
          });
        }
      }

      // Verify state if provided
      if (req.body.stateId) {
        const state = await locationService.getStateById(req.body.stateId);
        if (!state) {
          return res.status(404).json({
            success: false,
            error: 'State not found',
          });
        }
      }

      // Verify city if provided
      if (req.body.cityId) {
        const city = await locationService.getCityById(req.body.cityId);
        if (!city) {
          return res.status(404).json({
            success: false,
            error: 'City not found',
          });
        }
      }

      const street = await streetService.updateStreet(req.params.id, req.body);

      if (!street) {
        return res.status(404).json({
          success: false,
          error: 'Street not found',
        });
      }

      res.json({
        success: true,
        data: street,
      });
    } catch (error) {
      logger.error('Error updating street', {
        error: error.message,
        id: req.params.id,
        userId: req.user?.id,
      });
      next(error);
    }
  }
);

/**
 * DELETE /api/content/streets/:id
 * Delete street
 */
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const deleted = await streetService.deleteStreet(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Street not found',
      });
    }

    res.json({
      success: true,
      message: 'Street deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting street', { error: error.message, id: req.params.id });
    next(error);
  }
});

/**
 * GET /api/content/streets/locations/countries
 * Get all countries
 */
router.get('/locations/countries', authenticate, async (req, res, next) => {
  try {
    const countries = await locationService.getCountries();

    res.json({
      success: true,
      data: countries,
    });
  } catch (error) {
    logger.error('Error fetching countries', { error: error.message });
    next(error);
  }
});

/**
 * GET /api/content/streets/locations/states/:countryId
 * Get states by country
 */
router.get('/locations/states/:countryId', authenticate, async (req, res, next) => {
  try {
    const states = await locationService.getStatesByCountry(req.params.countryId);

    res.json({
      success: true,
      data: states,
    });
  } catch (error) {
    logger.error('Error fetching states', { error: error.message, countryId: req.params.countryId });
    next(error);
  }
});

/**
 * GET /api/content/streets/locations/cities
 * Get cities by state or country
 */
router.get('/locations/cities', authenticate, async (req, res, next) => {
  try {
    const { stateId, countryId } = req.query;

    let cities;
    if (stateId) {
      cities = await locationService.getCitiesByState(stateId);
    } else if (countryId) {
      cities = await locationService.getCitiesByCountry(countryId);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Either stateId or countryId is required',
      });
    }

    res.json({
      success: true,
      data: cities,
    });
  } catch (error) {
    logger.error('Error fetching cities', { error: error.message, query: req.query });
    next(error);
  }
});

module.exports = router;

