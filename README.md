## eslint-formatter-gradual

`gradual` is a formatter (output plugin?) for `eslint` which stores a
set of "allowances", such as "this rule is allowed in this file, but
not in new files", or "if you touch this file, you must fix this error".

This can facilitate the rollout of new rules to large codebases:

 1. Set the rule to `error` straight away.
 2. Add an allowance to your `gradual` configuration. 
 3. Run `eslint-gradual -w` to update the allowances for the project,
     stored in `.eslint-allowances.json`.
 4. The absence of the error is now enforced:
     * in new files,
     * in existing files which were clean right now,
     * and, optionally, as soon as anyone edits a file

### Hack note

Using this as a plugin/formatter is a *hack*, it mutates data it does not own. It
is dependent upon an implementation detail, but not on any internal code/data.

If the implementation detail breaks, you will just go back to all of your errors
being errors, so no safety would be lost.

The `eslint-gradual` CLI tool does not abuse internals like this, so is a safer
bet... but much harder to integrate into existing workflows.


### Screenshots

You can get eslint output like the following:

```text
$ eslint -f gradual *.mjs

com/example/one.mjs
     1:10   warning (ignored until touched)      'foo' never used   no-unused-vars
     4:5    warning (ignored for file)           Duplicate key 'a'  no-dupe-keys

com/example/two.mjs
     1:10   error   (was ignored until touched)  'baz' never used   no-unused-vars
     4:5    warning (ignored for file)           Duplicate key 'b'  no-dupe-keys

com/example/three.mjs
     2:10   error                                'bar' never used   no-unused-vars
     5:5    error                                Duplicate key 'c'  no-dupe-keys

✖ 6 problems (3 errors, 3 warnings)
```

In this project, both `no-dupe-keys` and `no-unused-vars` are listed as `error`s.
All three files have both of these errors in.

However, `no-dupe-keys` is still allowed in files which already had the problem,
when the rule was introduced. These files, `one.mjs` and `two.mjs`, have had the
`error` reduced to a warning.

`no-unused-vars` is a more serious problem, which we're working harder on
eliminating. As such, it must be fixed whenever a file is edited. `two.mjs`
has been edited by us, so we must now fix it, to clear the error.


### Configuration

`./.eslint-gradual.json` must exist, and its format consists of a list of
rules to soften, and under what condition they are softened. For example:

```json
{
  "softenRule": {
    "no-dupe-keys": "until-new-file",
    "no-unused-vars": "until-touched"
  }
}
```


### Usage

Update the allowances, when rules have changed, or when some files have
been fixed. The allowances data is (over)writen in place, it is assumed you
are using version control. You must cover all source files in one pass.

```text
$ eslint-gradual -w 'src/**/*.ts'
Wrote allowances for 262 files.
```
