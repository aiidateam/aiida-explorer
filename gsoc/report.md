# Google Summer of Code 2024 project report

## Proposal Link
[AIIDA-GOOGLE SUMMER OF CODE 2024](https://docs.google.com/document/d/1VQOJ9eUC1KmGdjK3tjwNfsAXz1ttTVwR7MdOs2SziRA/edit?usp=sharing)

## Mentors
- **Kristjan Eimre**
- **Edan Bainglass**
- **Xing Wang**
- **Jusong Yu**

## Project Overview

The objective of this project is to **develop an intuitive tool in React** for browsing AiiDA graphs, effectively replacing the outdated AiiDA Provenance Browser currently used in Materials Cloud Explore. This new tool will interface seamlessly with AiiDA via a REST API, allowing users to:
- **Dynamically explore graphs.**
- **Clearly differentiate between input and output nodes.**
- **Fully visualize all connecting nodes.**
- **Preview node details** without the need for page redirection.

The end goal is to create an **AiiDA node graph viewer** that is both robust and user-friendly, which will be developed in React and potentially published as a reusable component on the npm repository.

## Key Improvements Compared to Previous Version

- **Modernized User Interface:** Upgraded the existing interface from Angular to React, providing a more streamlined and responsive experience.
- **Enhanced Functionality:** Added new features that were missing in the previous implementation, ensuring a more comprehensive tool for users.
- **Increased Node Threshold:** Expanded the node display limit to handle larger and more complex graphs effectively.

## Project Timeline

### June 5 - June 30
- **Design Phase:**
  - Developed the blueprint for the project, considering various design approaches.
  - Created an initial design that is flexible enough to evolve and improve over time.
- **Research Phase:**
  - Evaluated different libraries that could enhance the provenance browser.
  - Compiled a list of pros and cons for each library to determine the best fit for the project.
- **Implementation Begins:**
  - Focused on the grid component, enabling dynamic API fetching when pages change.
  - Redesigned the table layout to enhance the user interface and overall experience.

### July 1 - July 30
- **Details Page & Provenance Browser Implementation:**
  - Began building the Details Page and the provenance browser, integrating the design improvements.
- **User Interface Enhancements:**
  - Refined the initial design, making it more user-friendly and intuitive.
- **New Features Implementation:**
  - Introduced new features that were previously lacking, ensuring a more robust tool.
- **Increased Node Threshold:**
  - Allowed the visualization of more extensive and complex node structures.

### August 1 - August 25
- **Bug Fixes & Code Reorganization:**
  - Focused on identifying and fixing bugs to ensure a smooth user experience.
  - Reorganized the codebase for better maintainability and readability.
- **Further Enhancements:**
  - Continued to refine the Graph Browser, making it more efficient and user-friendly.

## Documentation
For detailed documentation and updates on the project, visit [Project Repository](https://github.com/aiidateam/aiida-explorer).

## Future Goals

As of now, our implementation supports the local provenance view. Looking ahead, we’re planning to introduce the **global provenance view**. This broader perspective will allow you to visualize the interconnected nodes on a larger scale, rather than focusing solely on a small subset of nodes.
