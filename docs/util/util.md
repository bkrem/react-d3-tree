## Functions

<dl>
<dt><a href="#parseCSV">parseCSV(csvFilePath, attributeFields)</a> ⇒ <code>Promise</code></dt>
<dd><p>parseCSV - Parses a CSV file into a hierarchy structure.</p>
</dd>
<dt><a href="#parseJSON">parseJSON(jsonFilePath)</a> ⇒ <code>Promise</code></dt>
<dd><p>parseJSON - Parses a hierarchical JSON file that requires no further transformation.</p>
</dd>
<dt><a href="#parseFlatJSON">parseFlatJSON(jsonFilePath, attributeFields)</a> ⇒ <code>Promise</code></dt>
<dd><p>parseFlatJSON - Parses a flat JSON file into a hierarchy structure.</p>
</dd>
<dt><a href="#generateHierarchy">generateHierarchy(flatArray)</a> ⇒ <code>array.&lt;object&gt;</code></dt>
<dd><p>generateHierarchy - Generates a hierarchical array from
a flat array of links.</p>
</dd>
</dl>

<a name="parseCSV"></a>

## parseCSV(csvFilePath, attributeFields) ⇒ <code>Promise</code>
parseCSV - Parses a CSV file into a hierarchy structure.

**Kind**: global function  
**Returns**: <code>Promise</code> - Returns hierarchy array if resolved, error object if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| csvFilePath | <code>string</code> | Path to CSV file to be parsed. |
| attributeFields | <code>array.&lt;string&gt;</code> \| <code>undefined</code> | Set of column names to be used as attributes (optional) |

<a name="parseJSON"></a>

## parseJSON(jsonFilePath) ⇒ <code>Promise</code>
parseJSON - Parses a hierarchical JSON file that requires no further transformation.

**Kind**: global function  
**Returns**: <code>Promise</code> - Returns hierarchy array if resolved, error object if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| jsonFilePath | <code>string</code> | Path to JSON file to be parsed. |

<a name="parseFlatJSON"></a>

## parseFlatJSON(jsonFilePath, attributeFields) ⇒ <code>Promise</code>
parseFlatJSON - Parses a flat JSON file into a hierarchy structure.

**Kind**: global function  
**Returns**: <code>Promise</code> - Returns hierarchy array if resolved, error object if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| jsonFilePath | <code>string</code> | Path to flat JSON file to be parsed. |
| attributeFields | <code>array.&lt;string&gt;</code> \| <code>undefined</code> | Set of `link` fields to be used as attributes |

<a name="generateHierarchy"></a>

## generateHierarchy(flatArray) ⇒ <code>array.&lt;object&gt;</code>
generateHierarchy - Generates a hierarchical array from
a flat array of links.

**Kind**: global function  
**Returns**: <code>array.&lt;object&gt;</code> - Hierarchical single-element array.  

| Param | Type | Description |
| --- | --- | --- |
| flatArray | <code>array.&lt;object&gt;</code> | Flat array of `link` objects |

