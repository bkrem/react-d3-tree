import { csv, json } from 'd3';
import uuid from 'uuid';

/**
 * _transformToHierarchy - Transforms a flat array of parent-child links
 * into a hierarchy.
 * @private
 * @param {array<object>} links           Set of parent-child link objects
 * @param {array<string>|undefined} attributeFields Set of `link` fields to be used as attributes
 *
 * @return {array<object>} Single-element array containing the root node object.
 */
function _transformToHierarchy(links, attributeFields) {
  const nodesByName = {};

  const assignNode = name => {
    if (!nodesByName[name]) {
      nodesByName[name] = { name };
    }
    return nodesByName[name];
  };

  const assignNodeWithAttributes = (name, attributes) => {
    if (!nodesByName[name]) {
      nodesByName[name] = {
        name,
        attributes,
      };
    }
    return nodesByName[name];
  };

  // Create nodes for each unique source and target.
  links.forEach(link => {
    // if `attributeFields` is defined, create/overwrite current `link.attributes`
    if (attributeFields) {
      const customAttributes = {};
      attributeFields.forEach(field => {
        customAttributes[field] = link[field];
      });
      link.attributes = customAttributes;
    }

    link.source = assignNode(link.parent);
    link.target = assignNodeWithAttributes(link.child, link.attributes);
    const parent = link.source;
    const child = link.target;

    parent.id = uuid.v4();
    child.id = uuid.v4();
    child.parent = parent.name || null;

    parent._collapsed = child._collapsed = false; // eslint-disable-line
    // NOTE We assign to a custom `_children` field instead of D3's reserved
    // `children` to avoid update anomalies when collapsing/re-expanding nodes.
    parent._children ? parent._children.push(child) : (parent._children = [child]);
  });

  // Extract & return the root node
  const rootLinks = links.filter(link => !link.source.parent);
  return [rootLinks[0].source];
}

/**
 * parseCSV - Parses a CSV file into a hierarchy structure.
 *
 * @param {string} csvFilePath     Path to CSV file to be parsed.
 * @param {array<string>|undefined} attributeFields Set of column names to be used as attributes (optional)
 *
 * @return {Promise} Returns hierarchy array if resolved, error object if rejected.
 */
function parseCSV(csvFilePath, attributeFields) {
  return new Promise((resolve, reject) => {
    try {
      csv(csvFilePath, data => resolve(_transformToHierarchy(data, attributeFields))); // lol hello Lisp
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * parseJSON - Parses a hierarchical JSON file that requires no further transformation.
 *
 * @param {string} jsonFilePath Path to JSON file to be parsed.
 *
 * @return {Promise} Returns hierarchy array if resolved, error object if rejected.
 */
function parseJSON(jsonFilePath) {
  return new Promise((resolve, reject) => {
    try {
      json(jsonFilePath, data => resolve([data]));
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * parseFlatJSON - Parses a flat JSON file into a hierarchy structure.
 *
 * @param {string} jsonFilePath Path to flat JSON file to be parsed.
 * @param {array<string>|undefined} attributeFields Set of `link` fields to be used as attributes
 *
 * @return {Promise} Returns hierarchy array if resolved, error object if rejected.
 */
function parseFlatJSON(jsonFilePath, attributeFields) {
  return new Promise((resolve, reject) => {
    try {
      json(jsonFilePath, data => resolve(_transformToHierarchy(data, attributeFields)));
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * generateHierarchy - Generates a hierarchical array from
 * a flat array of links.
 *
 * @param {array<object>} flatArray Flat array of `link` objects
 *
 * @return {array<object>} Hierarchical single-element array.
 */
function generateHierarchy(flatArray) {
  return _transformToHierarchy(flatArray);
}

export default {
  parseCSV,
  parseJSON,
  parseFlatJSON,
  generateHierarchy,
};
