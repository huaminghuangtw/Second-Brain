<%*
const result = await tp.user.createProjectPost(tp);
if (!result) return;
const { title } = result;
-%>
---
title: <% title %>
---

<% tp.file.cursor() %>

### References

* 

### See Also

* 
