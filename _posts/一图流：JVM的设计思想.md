> 先有JMM，才有JVM+Java




我发现JMM的出现很有意义啊，解决了重排序问题和不同硬件和OS解决CPU缓存一致性问题的差异
as-if-seria和happens-before是不是属于JMM的规范之一啊，前者为了解决单线程重排序问题，后者为了解决多线程重排序问题
