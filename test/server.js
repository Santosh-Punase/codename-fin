import { expect, use } from 'chai';
import chaiHttp from 'chai-http';

const server = use(chaiHttp);

export { server, expect };
