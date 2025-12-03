/**
 * Street Service
 * Manages street CRUD operations and search
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

class StreetService {
  /**
   * Create a new street
   */
  async createStreet(data) {
    const { cityId, stateId, countryId, name, latitude, longitude, fullAddress } = data;

    try {
      const result = await pool.query(
        `INSERT INTO streets (city_id, state_id, country_id, name, latitude, longitude, full_address)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, city_id, state_id, country_id, name, latitude, longitude, full_address, 
                   contribution_count, last_contribution_at, created_at, updated_at`,
        [cityId, stateId, countryId, name, latitude, longitude, fullAddress]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating street', { error: error.message, data });
      throw error;
    }
  }

  /**
   * Get street by ID
   */
  async getStreetById(id) {
    try {
      const result = await pool.query(
        `SELECT s.id, s.city_id, s.state_id, s.country_id, s.name, s.latitude, s.longitude, 
                s.full_address, s.contribution_count, s.last_contribution_at, s.created_at, s.updated_at,
                c.name as city_name, st.name as state_name, co.name as country_name, co.code as country_code
         FROM streets s
         LEFT JOIN cities c ON s.city_id = c.id
         LEFT JOIN states st ON s.state_id = st.id
         LEFT JOIN countries co ON s.country_id = co.id
         WHERE s.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const street = result.rows[0];
      return {
        id: street.id,
        cityId: street.city_id,
        stateId: street.state_id,
        countryId: street.country_id,
        name: street.name,
        latitude: parseFloat(street.latitude),
        longitude: parseFloat(street.longitude),
        fullAddress: street.full_address,
        contributionCount: street.contribution_count,
        lastContributionAt: street.last_contribution_at,
        createdAt: street.created_at,
        updatedAt: street.updated_at,
        location: {
          city: street.city_name,
          state: street.state_name,
          country: street.country_name,
          countryCode: street.country_code,
        },
      };
    } catch (error) {
      logger.error('Error fetching street by ID', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Search streets
   */
  async searchStreets(filters = {}) {
    const {
      query,
      countryId,
      stateId,
      cityId,
      latitude,
      longitude,
      radius,
      limit = 50,
      offset = 0,
    } = filters;

    try {
      let whereConditions = [];
      let queryParams = [];
      let paramIndex = 1;

      // Text search
      if (query) {
        whereConditions.push(`s.name ILIKE $${paramIndex}`);
        queryParams.push(`%${query}%`);
        paramIndex++;
      }

      // Location filters
      if (countryId) {
        whereConditions.push(`s.country_id = $${paramIndex}`);
        queryParams.push(countryId);
        paramIndex++;
      }

      if (stateId) {
        whereConditions.push(`s.state_id = $${paramIndex}`);
        queryParams.push(stateId);
        paramIndex++;
      }

      if (cityId) {
        whereConditions.push(`s.city_id = $${paramIndex}`);
        queryParams.push(cityId);
        paramIndex++;
      }

      // Geographic search (within radius) - using Haversine formula approximation
      if (latitude && longitude && radius) {
        // Simple bounding box approximation (good enough for most use cases)
        // 1 degree latitude ≈ 111 km
        const latDelta = radius / 111;
        const lonDelta = radius / (111 * Math.cos((latitude * Math.PI) / 180));
        whereConditions.push(
          `s.latitude BETWEEN $${paramIndex} AND $${paramIndex + 1} AND 
           s.longitude BETWEEN $${paramIndex + 2} AND $${paramIndex + 3}`
        );
        queryParams.push(
          latitude - latDelta,
          latitude + latDelta,
          longitude - lonDelta,
          longitude + lonDelta
        );
        paramIndex += 4;
      }

      const whereClause =
        whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Get total count
      const countResult = await pool.query(
        `SELECT COUNT(*) as total FROM streets s ${whereClause}`,
        queryParams
      );
      const total = parseInt(countResult.rows[0].total);

      // Get streets
      queryParams.push(limit, offset);
      const result = await pool.query(
        `SELECT s.id, s.city_id, s.state_id, s.country_id, s.name, s.latitude, s.longitude, 
                s.full_address, s.contribution_count, s.last_contribution_at, s.created_at, s.updated_at,
                c.name as city_name, st.name as state_name, co.name as country_name, co.code as country_code
         FROM streets s
         LEFT JOIN cities c ON s.city_id = c.id
         LEFT JOIN states st ON s.state_id = st.id
         LEFT JOIN countries co ON s.country_id = co.id
         ${whereClause}
         ORDER BY s.name ASC
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        queryParams
      );

      const streets = result.rows.map((street) => ({
        id: street.id,
        cityId: street.city_id,
        stateId: street.state_id,
        countryId: street.country_id,
        name: street.name,
        latitude: parseFloat(street.latitude),
        longitude: parseFloat(street.longitude),
        fullAddress: street.full_address,
        contributionCount: street.contribution_count,
        lastContributionAt: street.last_contribution_at,
        createdAt: street.created_at,
        updatedAt: street.updated_at,
        location: {
          city: street.city_name,
          state: street.state_name,
          country: street.country_name,
          countryCode: street.country_code,
        },
      }));

      return {
        streets,
        total,
        limit,
        offset,
      };
    } catch (error) {
      logger.error('Error searching streets', { error: error.message, filters });
      throw error;
    }
  }

  /**
   * Update street
   */
  async updateStreet(id, data) {
    const { name, latitude, longitude, fullAddress, cityId, stateId, countryId } = data;

    try {
      const updates = [];
      const values = [];
      let paramIndex = 1;

      if (name !== undefined) {
        updates.push(`name = $${paramIndex}`);
        values.push(name);
        paramIndex++;
      }

      if (latitude !== undefined) {
        updates.push(`latitude = $${paramIndex}`);
        values.push(latitude);
        paramIndex++;
      }

      if (longitude !== undefined) {
        updates.push(`longitude = $${paramIndex}`);
        values.push(longitude);
        paramIndex++;
      }

      if (fullAddress !== undefined) {
        updates.push(`full_address = $${paramIndex}`);
        values.push(fullAddress);
        paramIndex++;
      }

      if (cityId !== undefined) {
        updates.push(`city_id = $${paramIndex}`);
        values.push(cityId);
        paramIndex++;
      }

      if (stateId !== undefined) {
        updates.push(`state_id = $${paramIndex}`);
        values.push(stateId);
        paramIndex++;
      }

      if (countryId !== undefined) {
        updates.push(`country_id = $${paramIndex}`);
        values.push(countryId);
        paramIndex++;
      }

      if (updates.length === 0) {
        return await this.getStreetById(id);
      }

      values.push(id);
      const result = await pool.query(
        `UPDATE streets 
         SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${paramIndex}
         RETURNING id, city_id, state_id, country_id, name, latitude, longitude, full_address, 
                   contribution_count, last_contribution_at, created_at, updated_at`,
        values
      );

      if (result.rows.length === 0) {
        return null;
      }

      return await this.getStreetById(id);
    } catch (error) {
      logger.error('Error updating street', { error: error.message, id, data });
      throw error;
    }
  }

  /**
   * Delete street
   */
  async deleteStreet(id) {
    try {
      const result = await pool.query('DELETE FROM streets WHERE id = $1 RETURNING id', [id]);
      return result.rows.length > 0;
    } catch (error) {
      logger.error('Error deleting street', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Increment contribution count
   */
  async incrementContributionCount(id) {
    try {
      await pool.query(
        `UPDATE streets 
         SET contribution_count = contribution_count + 1,
             last_contribution_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [id]
      );
    } catch (error) {
      logger.error('Error incrementing contribution count', { error: error.message, id });
      throw error;
    }
  }
}

module.exports = new StreetService();

