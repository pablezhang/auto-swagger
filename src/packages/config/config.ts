const urlAddress = 'http://192.168.33.8:8464/v2/api-docs';
import * as os from "os";

const parentFunTemplate = `
/**
 * @Description: </FileDescription/>
 * @Autho: ${os.hostname()}
 * @Date: ${new Date()}
 */
import Request from 'utils/Request';
class </parentFunName/> {
  </childFunList/>
}
export default new </parentFunName/>`;


const childFunTemplate = `
  /**
</childInfo/>
</childParams/>
   */
    public async </childFunName/> ({</childrenParams/>}) {
      return Request({
        </childrenUrl/>,
        method:</childrenMetHod/>,
        data: </childrenName/>,
        query: {</QueryNames/>},
        app: 'user',
      })
    }
`;

const outputPath ='haha/hehe';

const excludeParamName = [
  "Application-Key",
  "Access-Token",
  "extFields"
];

const config = {
  childFunTemplate,
  excludeParamName,
  outputPath,
  parentFunTemplate,
  url: urlAddress
};

module .exports =  config