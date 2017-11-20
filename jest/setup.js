/* eslint-disable */
import raf from './polyfills/raf'
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });