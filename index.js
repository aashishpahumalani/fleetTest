const express = require("express");
const { Octokit } = require("octokit");
const fetch = require("node-fetch");

//create express app
const app = express();

//port at which the server will run
const port = 3000;

const octokit = new Octokit({
  auth: "Token",
  request: { fetch },
});

//to get the commit detail using id
app.get(
  "/repositories/:owner/:repository/commits/:oid",
  async (request, response) => {
    const { owner, repository, oid } = request.params;
    if (!owner || !repository || !oid) {
      return response.json({ message: "Please Add All Required Parameters" });
    }

    try {
      const res = await octokit.request(
        `GET /repos/{owner}/{repo}/commits/{ref}`,
        {
          owner,
          repo: repository,
          ref: oid,
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );

      const data = res.data;
      const responseData = {
        oid: data.sha,
        message: data.commit.message,
        author: data.commit.author,
        committer: data.commit.committer,
        parents: data.parents.map((parent) => ({ oid: parent.sha })),
      };
      return response.json([responseData]);
    } catch (error) {
      return response.status(error.status ?? 500).json({
        message: error?.response?.data?.message ?? "Internal Server Error",
      });
    }
  }
);

//to get the commit difference
app.get(
  "/repositories/:owner/:repository/commits/:oid/diff",
  async (request, response) => {
    const { owner, repository, oid } = request.params;
    if (!owner || !repository || !oid) {
      return response.json({ message: "Please Add All Required Parameters" });
    }
    try {
      const res = await octokit.request(
        `GET /repos/{owner}/{repo}/compare/{basehead}`,
        {
          owner,
          repo: repository,
          basehead: oid,
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );

      return response.json({ data: res.data });
    } catch (error) {
      return response.status(error.status ?? 500).json({
        message: error?.response?.data?.message ?? "Internal Server Error",
      });
    }
  }
);

//start server and listen for the request
app.listen(port, () =>
  console.log(`server is listening at http://localhost:${port}`)
);
