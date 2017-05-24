import { csv, json } from 'd3';
import uuid from 'uuid';


function _transformToHierarchy(links, attributeFields) {
  const nodesByName = {};

  const assignNode = (name) => {
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
  links.forEach((link) => {
    // if `attributeFields` is defined, create/overwrite current `link.attributes`
    if (attributeFields) {
      const customAttributes = {};
      attributeFields.forEach((field) => {
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
    parent._children ? parent._children.push(child) : parent._children = [child];
  });

  // Extract & return the root node
  const rootLinks = links.filter((link) => !link.source.parent);
  return [rootLinks[0].source];
}


function parseCSV(csvFile, attributeFields) {
  return new Promise((resolve, reject) => {
    try {
      csv(csvFile, (data) => resolve(_transformToHierarchy(data, attributeFields))); // lol hello Lisp
    } catch (err) {
      reject(err);
    }
  });
}


function parseJSON(jsonFile) {
  return new Promise((resolve, reject) => {
    try {
      json(jsonFile, (data) => resolve([data]));
    } catch (err) {
      reject(err);
    }
  });
}


function parseFlatJSON(jsonFile, attributeFields) {
  return new Promise((resolve, reject) => {
    try {
      json(jsonFile, (data) => resolve(_transformToHierarchy(data, attributeFields)));
    } catch (err) {
      reject(err);
    }
  });
}

export default {
  parseCSV,
  parseJSON,
  parseFlatJSON,
};
