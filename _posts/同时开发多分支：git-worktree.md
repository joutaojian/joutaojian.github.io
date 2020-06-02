针对已经本地建好的分支：
git worktree add ../[工作分支名] [工作分支名]

针对已经本地未建好的分支：
git worktree add -b [工作分支名] ../[工作分支名] [被克隆的分支名]

git worktree add ../TREQ-1495_userinfo_richlevel TREQ-1495_userinfo_richlevel

git worktree add ../[工作分支名] [工作分支名]
变成
git worktree add ../TREQ-1495_userinfo_richlevel TREQ-1495_userinfo_richlevel

git worktree add -b TREQ-2307_richlevel_gray ../TREQ-2307_richlevel_gray TREQ-2307_richlevel_gray

怎么清除分支？
1.删除分支文件夹
2.执行命令：git worktree prune
