# Workflow patches

GitHub requires the `workflow` OAuth scope to add or change files under
`.github/workflows/`. The session that prepared this branch did not have
it, so the workflow change is provided here as a git patch instead.

Apply it from a checkout with normal credentials:

```sh
git am .patches/*.patch
git rm -r .patches
git commit -m "ci: remove applied workflow patches"
git push
```

| Patch | Changes |
| ----- | ------- |
| `0001-ci-run-the-build-workflow-on-master-and-main.patch` | `.github/workflows/build.yml`: run on pushes and pull requests to `master` (the default branch) as well as `main`. Previously the workflow only triggered on `main`, so it never ran for the default branch. The Node.js 24.x and 22.x matrix on Linux, Windows and macOS is unchanged. |

`git apply --check .patches/*.patch` verifies that the patch applies.
