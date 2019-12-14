# Digital Music Stand

[![Build Status](https://ci.patwie.com/api/badges/PatWie/digitalmusicstand/status.svg)](https://ci.patwie.com/PatWie/digitalmusicstand)

A simple cross-platform browser-based pdfjs-based viewer to display and search music sheets.

<img src="./.github/digitalmusicstand_001.jpg" />

* Fast, single binary which includes all assets.
* Usage is similar to Sublime. Press `P` and perform a fuzzy search.
* Not database required
* Shortcuts `1,2` to scroll to previous/next page using a programmable foot pedal.
* Unobtrusive design to download the file as a pdf

## DEMO

See [http://demo-digitalmusicstand.patwie.com/](http://demo-digitalmusicstand.patwie.com/) for a subset of the [Mutopia Project](https://www.mutopiaproject.org/) which are released under Creative Commons Attribution-ShareAlike.

#### Handling

Press `p` and then type `monlgiht3` (with typos).
You can use the arrow keys (up/down) to navigate. But for now select `Sonata No. 14 Moonlight (3rd Movement: Presto Agitato)` and press the `enter` key. To scroll to the next page use the right arrow key (or the key `2`).

#### Shortcuts

<dl>
  <dt>h</dt><dd> opens help dialog</dd>
  <dt>p</dt><dd> opens prompt for a query</dd>
  <dt>enter</dt><dd> loads select sheet</dd>
  <dt>esc</dt><dd> closes all modal dialogs</dd>
  <dt>arrow key down</dt><dd> selects next entry in result list</dd>
  <dt>arrow key up</dt><dd> selects previous entry in result list</dd>
  <dt>arrow key right or key '2'</dt><dd> scrolls to next page</dd>
  <dt>arrow key left or key '1'</dt><dd> scrolls to previous page</dd>
</dl>

The short cuts `1` and `2` are for a programmable foot pedal

## Get it

Download from the [release page](https://github.com/PatWie/digitalmusicstand/releases). The single binary contains all files.

## Or build it yourself

Or build it yourself:

```bash
git clone https://github.com/PatWie/digitalmusicstand.git
cd digitalmusicstand
./release.sh
```

## Usage

```bash
./digitalmusicstand --sheets /path/to/pdfs --port 3000
```

The files in the sheet directoy need to follow the convention `interpret_title.pdf`.
Whitespaces should be replaced by '-'.

Point your browser to `http://localhost:3000`

