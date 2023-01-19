import { removeTestProjectsFolder } from './util';

const globalTeardown = () => {
  console.log('Teardown test data');
  removeTestProjectsFolder();
  console.log('Teardown complete');
};

export default globalTeardown;
