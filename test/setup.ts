import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

// @ts-ignore
configure({ adapter: new Adapter() });

// jsdom doesn't implement the SVG animated properties that d3 reads: d3-interpolate reads
// `transform` when it tweens a `transform` attribute, and d3-zoom reads `width` and `height`
// to compute the zoom extent. Without them, zoom and transitions throw.
Object.defineProperty(SVGElement.prototype, 'transform', {
  configurable: true,
  get() {
    return { baseVal: { consolidate: () => null } };
  },
});
for (const name of ['width', 'height']) {
  Object.defineProperty(SVGElement.prototype, name, {
    configurable: true,
    get() {
      return { baseVal: { value: parseFloat(this.getAttribute(name)) || 0 } };
    },
  });
}
