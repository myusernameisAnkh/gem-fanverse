# 开启真正的跨设备留言

本项目已经包含 giscus 接口。giscus 把评论存进公开的 GitHub Discussions，适合与 GitHub Pages 配合。**它需要使用你自己的仓库信息，项目包不预填他人的仓库 ID。**

## 操作步骤

1. 先把本网站部署到 GitHub Pages。
2. 在仓库 **Settings → General → Features** 中启用 **Discussions**。
3. 打开 [giscus 官方配置页](https://giscus.app/zh-CN)。按配置页的指引，只为你选择的网站仓库安装 giscus GitHub App。
4. 在配置页填写 `你的用户名/仓库名`，选择讨论分类。建议新建一个 **Announcements** 类型的分类，名称可叫“应援留言”。
5. 从页面生成的配置中复制 `data-repo`、`data-repo-id`、`data-category`、`data-category-id` 四项公开值。
6. 打开项目根目录的 `config.js`，改成下面的形式。将示例文字全部替换为配置页给出的真实值：

```js
window.GEM_CONFIG = {
  giscus: {
    enabled: true,
    repo: "你的用户名/仓库名",
    repoId: "配置页生成的 data-repo-id",
    category: "应援留言",
    categoryId: "配置页生成的 data-category-id"
  }
};
```

7. 提交更新，等待 GitHub Pages 重新发布。刷新网页并滚动到“跨设备留言区”。使用两个浏览器或两台设备访问同一网站，确认双方能看到同一条测试评论。

**不要填写 GitHub personal access token、密码或其他私密密钥。上面的四项是公开配置。**

## 留言行为

- 所有访客可以读取公开留言，发表评论和反应需要 GitHub 登录与相应授权。
- 用户是在 giscus 的 GitHub 评论组件内发言；上方的彩色卡片表单始终属于本机留言模式。
- 两个区域不会自动同步。本机 JSON 导出也是个人备份，不会发布到 GitHub。
- 本项目固定使用 `specific` 映射和 `gemverse-guestbook-v1` 讨论标识。主页路径、锚点或部署子目录变化时，仍使用同一指定讨论标识。
- 管理、编辑、隐藏或删除公共评论，可前往仓库的 Discussions。站点不会暴露管理员令牌，也不会替访客自动发言。
- 关闭共享留言：把 `enabled` 改回 `false` 并提交；已有公共评论仍保留在你的 GitHub Discussions 中。

## 如果评论区没出现

- 检查仓库是否公开、Discussions 是否启用、giscus App 是否安装到对应仓库。
- 检查四项值是否来自**同一个仓库和同一个讨论分类**。
- 确认不是在双击打开的 `file://` 页面中测试。
- 检查学校网络、浏览器内容拦截或网络环境能否访问 GitHub 与 giscus。
- 若嵌入加载失败，可使用页面提供的 GitHub Discussions 链接直接留言。

参考：[giscus 官方说明与配置](https://giscus.app/zh-CN)。核验于 2026-10-29。此项目未使用你的 GitHub 账号进行安装、授权或线上发言，这些步骤由仓库拥有者在部署时完成。
