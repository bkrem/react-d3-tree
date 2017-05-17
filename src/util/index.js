import { csv } from 'd3';
import uuid from 'uuid';

function _formatJSON(links) {
  const nodesByName = {};

  function assignNode(name) {
    if (!nodesByName[name]) {
      nodesByName[name] = { name };
    }
    return nodesByName[name];
  }

  function assignNodeWithAttributes(name, attributes) {
    if (!nodesByName[name]) {
      nodesByName[name] = {
        name,
        attributes,
      };
    }
    return nodesByName[name];
  }

  // Create nodes for each unique source and target.
  links.forEach((link) => {
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

  return links;
}

function _extractRootNode(links) {
  // Locate all node relations where `source` has an undefined `parent` field.
  const rootLinks = links.filter((link) => !link.source.parent);
  return [rootLinks[0].source];
}

function parseCSV(csvFile) {
  return new Promise((resolve, reject) => {
    try {
      csv(csvFile, (json) => resolve(_extractRootNode(_formatJSON(json)))); // lol hello Lisp
    } catch (err) {
      reject(err);
    }
  });
}

export default {
  parseCSV,
};
