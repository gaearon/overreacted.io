---
title: 旁若無人的修理
date: '2019-02-15'
spoiler: 另一種形式的技術債。
---

某些技術債是非常顯而易見的。

設計不佳的資料結構可能會導致複雜難懂的程式碼。每當需求持續變動的時候，程式碼可能會包含著為了完成先前需求所遺留下來的痕跡。某些程式碼可能是在緊急或是單純只是馬虎的狀況下完成的。

這種類型的技術債因為顯而易見，所以是很容易被提出來討論的。它會以某些形式呈現出來：例如程式錯誤、效能問題、或是難以在其中增加新的功能。

然而還有另一種陰險類型的技術債。

可能某組測試*有點*慢。它並沒有慢到像爬行一般，但剛好足以讓你覺得需要找出可能的問題並將它放進了待辦事項。也許你並不信任部署的腳本所以你跳過了額外的版本發布。或許抽象層讓程式碼難以找出實際的效能瓶頸所以你標注了 TODO 在程式碼裡。有時候單元測試太嚴格了，所以讓你在上線了預計的功能之後才願意嘗試新的想法。

以上沒有任何一個情況是嚴重到足以停止你的開發。它們僅會被視作一些令人分心的事物。抱怨這些事情令人感到徒勞無功。畢竟，如果它們*真的*很重要，儘管讓你感到有摩擦力，你仍早就會完成那些事情，不是嗎？

這些東西永遠不會被完成。它們看起來不夠重要。 **摩擦會讓它們消失。** 對於它們，某些嘗試的探索可能毫無結果，某些則是會重新定義你的專案。

你永遠不知道結果是什麼。這就是為什麼你必須主動的減少摩擦。當作你的專案的命運由這些摩擦來決定，因為它真的是。

旁若無人的修理。