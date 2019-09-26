const urlAddress = 'http://192.168.33.8:8464/v2/api-docs';
const os = require('os');

const parentFunTemplate = `
/**
 * @Description: </FileDescription/>
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

const outputPath ='Services';

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

exports.config = config;