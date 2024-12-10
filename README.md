> A programmer should program the way s/he programs.

This system turns Obsidian into an IDE with features including:
- Execute multiple programming languages
- Block-based code composing (notebook like experience)
- AI assistant

It's a complex system composed of two parts.
First, an Obsidian plugin called [markcode engine](https://github.com/shuxueshuxue/Markcode-engine), which is designed to run Python scripts in Obsidian environment.

Key commands offered by this plugin include:

```
Markcode Engine: Run Code
Markcode Engine: Run Script
Markcode Engine: Stop Running
```

Second, an extensive set of [modules and scripts](https://github.com/shuxueshuxue/Markcode-modules). It currently relies on PowerShell scripts to compile and execute code from other programming languages (C++, Rust, Haskell, JavaScript). So if you want to use this functionality make sure PowerShell is installed.

The folder structure of your Obsidian vault should be set up as this:

```
vaultName
	- Modules
	- Scripts
	- Logs
```

It is strongly recommended to use the [fix-require-modules](https://github.com/mnaoumov/obsidian-fix-require-modules), [Templater]( https://github.com/SilentVoid13/Templater ) and [Codeblock Customizer](https://github.com/mugiwara85/CodeblockCustomizer) along with this system.

## Example Usage

### Run Rust Code

First, set up an external rust project.
Suppose it's `D:\Codebase\rustplay`. Then open an arbitrary note in your Obsidian and write three code blocks as follows:

````
```push fold
D:\Codebase\rustplay\src\main.rs
```

```python fold
import testflow
testflow.rustplay()
```

```rust
// your code here
```
````

![](assets/Markcode%20engine%20document.png)
