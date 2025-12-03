/**
 * Location Service
 * Manages countries, states, and cities
 */

const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  database: process.env.DB_NAME || 'henmo_ai_dev',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

class LocationService {
  /**
   * Get all countries
   */
  async getCountries() {
    try {
      const result = await pool.query(
        'SELECT id, code, name, created_at FROM countries ORDER BY name ASC'
      );
      return result.rows;
    } catch (error) {
      logger.error('Error fetching countries', { error: error.message });
      throw error;
    }
  }

  /**
   * Get country by code
   */
  async getCountryByCode(code) {
    try {
      const result = await pool.query(
        'SELECT id, code, name, created_at FROM countries WHERE code = $1',
        [code.toUpperCase()]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error fetching country by code', { error: error.message, code });
      throw error;
    }
  }

  /**
   * Get country by ID
   */
  async getCountryById(id) {
    try {
      const result = await pool.query(
        'SELECT id, code, name, created_at FROM countries WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error fetching country by ID', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Create country
   */
  async createCountry(data) {
    const { code, name } = data;
    try {
      const result = await pool.query(
        'INSERT INTO countries (code, name) VALUES ($1, $2) RETURNING id, code, name, created_at',
        [code.toUpperCase(), name]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        // Unique violation
        throw new Error('Country with this code already exists');
      }
      logger.error('Error creating country', { error: error.message, data });
      throw error;
    }
  }

  /**
   * Get states by country
   */
  async getStatesByCountry(countryId) {
    try {
      const result = await pool.query(
        'SELECT id, country_id, code, name, created_at FROM states WHERE country_id = $1 ORDER BY name ASC',
        [countryId]
      );
      return result.rows;
    } catch (error) {
      logger.error('Error fetching states by country', {
        error: error.message,
        countryId,
      });
      throw error;
    }
  }

  /**
   * Get state by ID
   */
  async getStateById(id) {
    try {
      const result = await pool.query(
        'SELECT id, country_id, code, name, created_at FROM states WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error fetching state by ID', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Create state
   */
  async createState(data) {
    const { countryId, code, name } = data;
    try {
      const result = await pool.query(
        'INSERT INTO states (country_id, code, name) VALUES ($1, $2, $3) RETURNING id, country_id, code, name, created_at',
        [countryId, code, name]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('State with this code already exists in this country');
      }
      logger.error('Error creating state', { error: error.message, data });
      throw error;
    }
  }

  /**
   * Get cities by state
   */
  async getCitiesByState(stateId) {
    try {
      const result = await pool.query(
        'SELECT id, state_id, country_id, name, latitude, longitude, created_at FROM cities WHERE state_id = $1 ORDER BY name ASC',
        [stateId]
      );
      return result.rows;
    } catch (error) {
      logger.error('Error fetching cities by state', { error: error.message, stateId });
      throw error;
    }
  }

  /**
   * Get cities by country
   */
  async getCitiesByCountry(countryId) {
    try {
      const result = await pool.query(
        'SELECT id, state_id, country_id, name, latitude, longitude, created_at FROM cities WHERE country_id = $1 ORDER BY name ASC',
        [countryId]
      );
      return result.rows;
    } catch (error) {
      logger.error('Error fetching cities by country', {
        error: error.message,
        countryId,
      });
      throw error;
    }
  }

  /**
   * Get city by ID
   */
  async getCityById(id) {
    try {
      const result = await pool.query(
        'SELECT id, state_id, country_id, name, latitude, longitude, created_at FROM cities WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error fetching city by ID', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Create city
   */
  async createCity(data) {
    const { stateId, countryId, name, latitude, longitude } = data;
    try {
      const result = await pool.query(
        'INSERT INTO cities (state_id, country_id, name, latitude, longitude) VALUES ($1, $2, $3, $4, $5) RETURNING id, state_id, country_id, name, latitude, longitude, created_at',
        [stateId, countryId, name, latitude, longitude]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating city', { error: error.message, data });
      throw error;
    }
  }

  /**
   * Get location hierarchy (country -> state -> city)
   */
  async getLocationHierarchy(countryId, stateId = null, cityId = null) {
    try {
      const hierarchy = {};

      if (countryId) {
        hierarchy.country = await this.getCountryById(countryId);
        if (hierarchy.country && stateId) {
          hierarchy.state = await this.getStateById(stateId);
          if (hierarchy.state && cityId) {
            hierarchy.city = await this.getCityById(cityId);
          }
        }
      }

      return hierarchy;
    } catch (error) {
      logger.error('Error fetching location hierarchy', {
        error: error.message,
        countryId,
        stateId,
        cityId,
      });
      throw error;
    }
  }
}

module.exports = new LocationService();

