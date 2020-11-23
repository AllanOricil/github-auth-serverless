const axios = require('axios');
const { getAccessToken, getUser, getUserEmails } = require('../../../src/services/github');
const githubCredentials = require('../../data/github_credentials.json');
const user = require('../../data/user.json');
const userEmails = require('../../data/user_emails.json');

jest.mock('axios');
 
describe('test github calls', () => {

it('fetches github access_token', async () => {
    axios.post.mockImplementationOnce(() => Promise.resolve(githubCredentials));
    await expect(getAccessToken()).resolves.toEqual(githubCredentials);
  });

it('fetches github user details', async () => {
    axios.get.mockImplementationOnce(() => Promise.resolve(user));
    await expect(getUser('token')).resolves.toEqual(user);
  });

it('fetches github user emails', async () => {
    axios.get.mockImplementationOnce(() => Promise.resolve(userEmails));
    await expect(getUserEmails('token')).resolves.toEqual(userEmails);
  });
});