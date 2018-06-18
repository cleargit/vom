package com.example.sell2.controller;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.aliyun.oss.OSSClient;
import com.aliyun.oss.model.ListObjectsRequest;
import com.aliyun.oss.model.OSSObjectSummary;
import com.aliyun.oss.model.ObjectListing;
import com.example.sell2.emums.BlogEnum;
import com.example.sell2.entity.UserInfo;
import com.example.sell2.resultvo.ResultVo;
import com.example.sell2.server.Userinfoserver;
import com.example.sell2.util.ResultUtil;
import com.example.sell2.util.SecurityU;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.*;
import java.util.*;

@RestController
public class FileController
{
    @Autowired
    Userinfoserver userinfoserver;
    public static final Integer MAX=1048576;

    public static final String ENDPOINT="oss-cn-shenzhen.aliyuncs.com";
    public static final String ACCESSKEYID="LTAIVUF2Krgp1u4Z";
    public static final String ACCESSKEYSECRET="k78gbDqJxvZ1ovhnZzeKq8vvgJBqlm";
    public static final String BUCKET="mybucket99";
    @PostMapping("/upload.do")
    public Map<String,String> upload(@RequestParam(value = "file")MultipartFile file, @RequestParam(value = "id") Integer id)
    {
        Map<String,String> map=new HashMap<>();
        try {
            int size=file.getBytes().length;
            if(size>MAX)
            {
                map.put("code","0");
                map.put("msg","图片超过1mb");
                return map;
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        UserInfo userInfo=userinfoserver.findone(id);
        if (!SecurityU.simpleCheck(userInfo)){
            map.put("code","0");
            map.put("msg","错误");
            return map;
        }
        if(file.isEmpty())
        {
            return null;
        }

        OSSClient ossClient=new OSSClient(ENDPOINT,ACCESSKEYID,ACCESSKEYSECRET);
        String name=file.getOriginalFilename();
        String last=name.substring(name.lastIndexOf("."));
        String key=String.valueOf(id)+last;
        try {
            ossClient.putObject(BUCKET, key, new ByteArrayInputStream(file.getBytes()));
        }catch (IOException e) {
            map.put("code","0");
            map.put("msg","上传失败");
            return map;
        }finally {
            ossClient.shutdown();
        }
        userInfo.setImg("http://mybucket99.oss-cn-shenzhen.aliyuncs.com/"+key);
        userinfoserver.insert(userInfo);
        map.put("img","http://mybucket99.oss-cn-shenzhen.aliyuncs.com/"+key);
        map.put("msg","上传成功");
        return map;
    }
    @PostMapping("/myupload.do")
    public Object upload(@RequestParam(value = "file")MultipartFile file)
    {
        JSONObject jsonObject=new JSONObject();
        String mywork="myblogimg/";
        String name=file.getOriginalFilename();
        String begin=name.substring(0,name.lastIndexOf("."));
        String last=name.substring(name.lastIndexOf("."));
        String save=begin+"_"+UUID.randomUUID().toString()+last;
        String result=mywork+save;
        List<String> list=new ArrayList<>();
        OSSClient ossClient=new OSSClient(ENDPOINT,ACCESSKEYID,ACCESSKEYSECRET);
        try {
            ossClient.putObject(BUCKET, result, new ByteArrayInputStream(file.getBytes()));
            list.add("http://mybucket99.oss-cn-shenzhen.aliyuncs.com/"+result);
            jsonObject.put("errno",0);
            jsonObject.put("data",list);
        }catch (IOException e)
        {
            jsonObject.put("errno",1);
        }finally {
            ossClient.shutdown();
        }
        return jsonObject;
    }
    @GetMapping("/getimg.do")
    public ResultVo getimg(){
        OSSClient ossClient=new OSSClient(ENDPOINT,ACCESSKEYID,ACCESSKEYSECRET);
        ListObjectsRequest listObjectsRequest = new ListObjectsRequest(BUCKET);
        listObjectsRequest.setPrefix("myblogimg/");
        ObjectListing listing = ossClient.listObjects(listObjectsRequest);
        for (OSSObjectSummary objectSummary : listing.getObjectSummaries()) {
            System.out.println(objectSummary.getKey());
        }
        ossClient.shutdown();
        return ResultUtil.success(listing.getObjectSummaries());
    }
    @PostMapping("/delect.do")
    public ResultVo delect(String list){
        if (StringUtils.isEmpty(list)){
            return ResultUtil.error(BlogEnum.ID_NULL);
        }
        List<String> target=JSONArray.parseArray(list,String.class);
        OSSClient ossClient=new OSSClient(ENDPOINT,ACCESSKEYID,ACCESSKEYSECRET);
        for (int i = 0; i <target.size() ; i++) {
            ossClient.deleteObject(BUCKET, target.get(i));
        }
        ossClient.shutdown();
        return ResultUtil.success("删除成功");
    }
}
