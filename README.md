> A programmer should program the way s/he programs.

⚠️ **Important**: This system requires TWO components to work:
1. [Markcode Engine](https://github.com/shuxueshuxue/Markcode-engine) - The core Obsidian plugin
2. [Markcode Modules](https://github.com/shuxueshuxue/Markcode-modules) - The modules and scripts

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
vaultRoot
	- Modules
	- Scripts
	- Logs
```

It is strongly recommended to use the [fix-require-modules](https://github.com/mnaoumov/obsidian-fix-require-modules), [Templater]( https://github.com/SilentVoid13/Templater ) and [Codeblock Customizer](https://github.com/mugiwara85/CodeblockCustomizer) along with this system.

## Script Hotkeys Manager

Hotkeys can be set up this way:
- Edit the `Scripts/Script Hotkey Manager.md` file
- Execute command `Markcode Engine: Run Code` to **extract code file**
- Restart Obsidian to apply change

for more details, refer to [Writing Code In A Decentralized Way - JFR's Mathematical Lab](https://publish.obsidian.md/jeffry/Blogs/Markcode/Writing+Code+In+A+Decentralized+Way)

## Example Usage

### Run Custom Scripts

- Currently, it requires using [QuickAdd](https://github.com/chhoumann/quickadd) plugin to execute the script `Scripts/✨ Run Script.js`.

![](assets/Markcode%20engine%20document-1.png)

- The `EditText` script allow user to send instruction to LLMs to edit the selected text.

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
