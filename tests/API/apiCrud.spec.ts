import { test, expect } from '@playwright/test';

// API practice test against a free public fake API (jsonplaceholder).
// It shows the 4 CRUD methods: POST (create), GET (read), PUT (update), DELETE (delete).
const API_URL = 'https://jsonplaceholder.typicode.com/posts';

test('API CRUD - POST GET PUT DELETE', async ({ request }) => {

    // POST - create a new post
    const postResponse = await request.post(API_URL, {
        data: { title: 'OrangeHRM API Automation', body: 'Created using Playwright API', userId: 1 }
    });
    expect(postResponse.status()).toBe(201);
    const createdPost = await postResponse.json();
    expect(createdPost.title).toBe('OrangeHRM API Automation');
    expect(createdPost.id).toBeDefined();

    // GET - read post number 1
    const getResponse = await request.get(API_URL + '/1');
    expect(getResponse.status()).toBe(200);
    const post = await getResponse.json();
    expect(post.id).toBe(1);

    // PUT - update post number 1
    const putResponse = await request.put(API_URL + '/1', {
        data: { id: 1, title: 'Updated OrangeHRM API Automation', body: 'Updated using Playwright API', userId: 1 }
    });
    expect(putResponse.status()).toBe(200);
    const updatedPost = await putResponse.json();
    expect(updatedPost.title).toBe('Updated OrangeHRM API Automation');

    // DELETE - delete post number 1
    const deleteResponse = await request.delete(API_URL + '/1');
    expect(deleteResponse.status()).toBe(200);

});
