# React

## Preparation

### Create a React App

- [Create React App (CRA)](https://create-react-app.dev/docs/getting-started/)
- Vite
  1.  `npm create vite@latest`
      a. Enter <project-name> (e.g., react-app)
      b. Select "React" as framework
      c. Select "TypeScript" as variant
  2.  `cd <project-name>`
  3.  `npm install`
  4.  `npm run dev`
  5.  Use Bootstrap as the CSS framwork
      a. `npm install bootstrap@5.2.3`
      b. Delete contents in `App.css` and `index.css`
      c. In `main.tsx`, replace `import './index.css'` with `import 'bootstrap/dist/css/bootstrap.css'`
  6.  Install [Prettier - Code Formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extension
  7.  `Ctrl + Shift + P` > "Format Document"
  8.  `Ctrl + Shift + P` > "Wrap with Abbreviation" > "div"
  9.  Install [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)

### Fragments

```
// Method I
// function ListGroup() {
//   return (
//     <div>
//       <h1>List Group</h1>
//       <ul className="list-group">
//         <li className="list-group-item">An item</li>
//         <li className="list-group-item">A second item</li>
//         <li className="list-group-item">A third item</li>
//         <li className="list-group-item">A fourth item</li>
//         <li className="list-group-item">And a fifth one</li>
//       </ul>
//     </div>
//   );
// }

// Method II
// import { Fragment } from "react";

// function ListGroup() {
//   return (
//     <Fragment>
//       <h1>List Group</h1>
//       <ul className="list-group">
//         <li className="list-group-item">An item</li>
//         <li className="list-group-item">A second item</li>
//         <li className="list-group-item">A third item</li>
//         <li className="list-group-item">A fourth item</li>
//         <li className="list-group-item">And a fifth one</li>
//       </ul>
//     </Fragment>
//   );
// }

// Method III
function ListGroup() {
  return (
    <>
      <h1>List Group</h1>
      <ul className="list-group">
        <li className="list-group-item">An item</li>
        <li className="list-group-item">A second item</li>
        <li className="list-group-item">A third item</li>
        <li className="list-group-item">A fourth item</li>
        <li className="list-group-item">And a fifth one</li>
      </ul>
    </>
  );
}

export default ListGroup;
```

### Rendering

```
function ListGroup() {
  let items = ["Mallorca", "Dolomites", "Girona", "Flanders", "Stelvio"];

  const getMessage = () => {
    // return items.length === 0 ? <p>No item found.</p> : null;
    return items.length === 0 && <p>No item found.</p>;
  };

  return (
    <>
      <h1>List Group</h1>
      {getMessage()}
      <ul className="list-group">
        {items.map((item) => (
          <li className="list-group-item" key={item}>
            {item}
          </li>
        ))}
      </ul>
    </>
  );
}

export default ListGroup;
```

### Handling Events (Event Listeners)

- Example Code 1

```
function ListGroup() {
  let items = ["Mallorca", "Dolomites", "Girona", "Flanders", "Stelvio"];

  const getMessage = () => {
    // return items.length === 0 ? <p>No item found.</p> : null;
    return items.length === 0 && <p>No item found.</p>;
  };

  return (
    <>
      <h1>List Group</h1>
      {getMessage()}
      <ul className="list-group">
        {items.map((item, index) => (
          <li
            className="list-group-item"
            key={item}
            onClick={() => console.log(item, index)}
          >
            {item}
          </li>
        ))}
      </ul>
    </>
  );
}

export default ListGroup;
```

- Example Code 2

```
import { MouseEvent } from "react";

function ListGroup() {
  let items = ["Mallorca", "Dolomites", "Girona", "Flanders", "Stelvio"];

  // Event Handler
  const handleClick = (event: MouseEvent) => console.log(event);

  return (
    <>
      <h1>List Group</h1>
      <ul className="list-group">
        {items.map((item, index) => (
          <li className="list-group-item" key={index} onClick={handleClick}>
            {item}
          </li>
        ))}
      </ul>
    </>
  );
}

export default ListGroup;
```

### Hooks

#### useState

```
import { useState } from "react";

function ListGroup() {
  let items = ["Mallorca", "Dolomites", "Girona", "Flanders", "Stelvio"];

  // Hook
  const [selectedIndex, setSelectedIndex] = useState(-1);
  // selectedIndex: variable
  // setSelectedIndex: updater function to update the variable selected

  return (
    <>
      <h1>List Group</h1>
      <ul className="list-group">
        {items.map((item, index) => (
          <li
            className={
              selectedIndex === index
                ? "list-group-item active"
                : "list-group-item"
            }
            key={index}
            onClick={() => {
              setSelectedIndex(index);
            }}
          >
            {item}
          </li>
        ))}
      </ul>
    </>
  );
}

export default ListGroup;
```

#### useEffect

- Example Code 1

```
import { useState, useEffect } from "react";

export default function App() {
  const [resourceType, setResourceType] = useState("posts");

  console.log("render");

  //   useEffect(() => {
  //     console.log("resource type changed");
  //   }, [resourceType]);

  useEffect(() => {
    console.log("onMount");
  }, []);

  return (
    <>
      <div>
        <button onClick={() => setResourceType("posts")}>Posts</button>
        <button onClick={() => setResourceType("users")}>Users</button>
        <button onClick={() => setResourceType("comments")}>Comments</button>
      </div>
      <h1>{resourceType}</h1>
    </>
  );
}
```

- Example Code 2

```
import { useState, useEffect } from "react";

export default function App() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <div>{windowWidth}</div>;
}
```

### Passing Data via Props

```
import { useState } from "react";

interface Prop {
  items: string[];
  heading: string;
}

function ListGroup({ items, heading }: Prop) {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  return (
    <>
      <h1>{heading}</h1>
      <ul className="list-group">
        {items.map((item, index) => (
          <li
            className={
              selectedIndex === index
                ? "list-group-item active"
                : "list-group-item"
            }
            key={index}
            onClick={() => {
              setSelectedIndex(index);
            }}
          >
            {item}
          </li>
        ))}
      </ul>
    </>
  );
}

export default ListGroup;

```

### Passing Functions via Props

ListGroup.tsx

```
import { useState } from "react";

interface Prop {
  items: string[];
  heading: string;
  onSelectItem: (item: string) => void;
}

function ListGroup({ items, heading, onSelectItem }: Prop) {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  return (
    <>
      <h1>{heading}</h1>
      <ul className="list-group">
        {items.map((item, index) => (
          <li
            className={
              selectedIndex === index
                ? "list-group-item active"
                : "list-group-item"
            }
            key={index}
            onClick={() => {
              setSelectedIndex(index);
              onSelectItem(item);
            }}
          >
            {item}
          </li>
        ))}
      </ul>
    </>
  );
}

export default ListGroup;
```

App.tsx

```
import ListGroup from "./components/ListGroup";

function App() {
  let items = ["Mallorca", "Dolomites", "Girona", "Flanders", "Stelvio"];
  let heading = "Cycling Paradise";

  const handleSelectItem = (item: string) => {
    console.log(item);
  };

  return (
    <div>
      <ListGroup
        items={items}
        heading={heading}
        onSelectItem={handleSelectItem}
      />
    </div>
  );
}

export default App;
```

### State v.s Props

|          **State**          |           **Props**           |
| :-------------------------: | :---------------------------: |
| Data managed by a component |  Input passed to a component  |
| Similar to local variables  | Similar to function arguments |
|           Mutable           |           Immutable           |
|      Cause a re-render      |       Cause a re-render       |

- Learn how to handle routing in a React application using React Router
  - Create a multi-page React app with navigation
- Understand Redux (a popular state management library for React)
  - Learn how to set up Redux, create reducers, actions, and connect Redux to your React application
