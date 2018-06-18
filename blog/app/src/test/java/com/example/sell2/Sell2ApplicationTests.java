package com.example.sell2;


import com.example.sell2.entity.SysPermissionInit;
import com.example.sell2.entity.SysRole;
import com.example.sell2.entity.UserInfo;
import com.example.sell2.quartz.Server.QuartzUitl;
import com.example.sell2.redis.BlogKey;
import com.example.sell2.repository.Myrepository;
import com.example.sell2.repository.SysRoleRepsitory;
import com.example.sell2.server.SyspermissionServer;
import com.example.sell2.server.Userinfoserver;
import com.example.sell2.util.RedisUtil;
import org.apache.shiro.crypto.hash.SimpleHash;
import org.apache.shiro.util.ByteSource;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.test.context.junit4.SpringRunner;

import javax.servlet.Servlet;
import java.util.*;
import java.util.stream.Collectors;

@RunWith(SpringRunner.class)
@SpringBootTest
public class Sell2ApplicationTests {

	@Autowired
	private SyspermissionServer syspermissionServer;
	@Autowired
	private Userinfoserver userinfoserver;
	@Autowired
	private QuartzUitl quartzUitl;
	@Autowired
	private Myrepository myrepository;
	@Autowired
	RedisTemplate redisTemplate;
	@Autowired
	private SysRoleRepsitory roleRepsitory;
	@Autowired
	private RedisUtil redisUtil;
	@Test
	public void contextLoads() {

		UserInfo userInfo=userinfoserver.findbyname("admin");
		String hex=new SimpleHash("md5","123456", ByteSource.Util.bytes(userInfo.getCredentialsSalt()),2).toHex();
		Assert.assertEquals(userInfo.getPassword(),hex);
	}
	@Test
	public void Test()
	{
		List<SysPermissionInit> result=syspermissionServer.findAllpermission();
		Assert.assertNotEquals(0,result.size());
	}
	@Test
	public void newTest()
	{
		List<Integer> lists = Arrays.asList(1, 2, 3, 4, 2, 6, 4, 7, 8, 7);
		List<Integer> list=lists.stream().filter(e ->e>=3)
							.sorted((n1,n2)->n2.compareTo(n1))
							.limit(3)
							.collect(Collectors.toList());
	}
	@Test
	public void delele(){
		try {
			String JOB_NAME="JOB_";
			String JOB_GROUP="JOB_GROUP_";
			quartzUitl.delete(JOB_NAME+"redis2sql",JOB_GROUP+"common");
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	@Test
	public void redislist(){
		List<Object> strings = new ArrayList<Object>();

		strings.add("1");
		strings.add("2");
		strings.add("3");
		redisTemplate.opsForList().leftPushAll("listcollection4", strings);
		System.out.println(redisTemplate.opsForList().range("listcollection4",0,-1));
	}
	@Test
	public void test(){
	Object o=myrepository.a(2);

		System.out.println();
	}
	@Test
//	@Transactional
	public void getone(){
		UserInfo a=myrepository.getOne(1);
		Object b=myrepository.findById(1);
		System.out.println(a.getName());
		System.out.println("hello");
	}
	@Test
	public void a(){
		SysRole sysRole=roleRepsitory.findById(3).get();
		sysRole.setDescription("普通会员z");
		roleRepsitory.save(sysRole);

	}
	@Test
	public void b(){
		SysRole sysRole=new SysRole();
		sysRole.setId(4);
		sysRole.setDescription("访客");
		roleRepsitory.save(sysRole);

	}
}
