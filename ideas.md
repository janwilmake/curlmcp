# MCP interacting with GitHub, X, and API specs.

Work towards making this work perfectly. In the end, instructions aren't even needed, as I can replace it programatically. The important thing is that the LLM gets guided properly in the responses and knows and can tell the user what's actually happening and tells the user how he done it, so people end up actually sharing the link containing the og:image.

After this works smoothly, #1 to figure out is auth, to track usage of this MCP. GitHub oauth is best!

Let's work towards this as an ultimate MCP!

The philosophy behind slop can be embedded as additional params in the openapi; `x-workflow-operations: string[]`.

This could ensure that it shows a summary of how to use these operation(s) using GET, such that it becomes a workflow.

# Conversation sessionId

Ensure a sessionID of the conversation is sent, which we can use to estimate tokensize. When tokensize becomes excessively large, ensure instructions are added that summarize the obtained context so far and a link to start a new conversation.

# safari ext for browsing in markdown and rendering it as markdown too

https://claude.ai/share/952bfd94-ca94-4da1-8682-e8bdc9cf5d9a

the goal would be to see if a website is fully LLM ready by clicking around and see if all is reachable and easy to understand.

# other name

mcp-mcp
