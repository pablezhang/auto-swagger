const url = 'http://192.168.33.12:8960/v2/api-docs';

const parentFunTemplate = `
/**
 * @Description: </FileDescription/>
 */
// @ts-ignore
import Request from 'utils/request';
class </parentFunName/> {
  </childFunList/>
}
export default new </parentFunName/>`;

const centerName = 'user';

const childFunTemplate = `
  /**
</childInfo/>
</childParams/>
   */
    public async </childFunName/> ({</childrenParams/>, ...restQuery}: {</childrenParaTypes/>}, restParam={}) {
      return Request({
        </childrenUrl/>,
        method:</childrenMetHod/>,
        data: </childrenName/>,
        query: {...restQuery, </QueryNames/>},
        app: </Centername/>,
        version: </version/>,
        ...restParam
      })
    }
`;

const outputPath ='./ts-src/Services';

const excludeParamName = [
  "Application-Key",
  "Access-Token",
  "extFields",
  "yes.req.instanceId",
  "yes.req.tenantId",
  "yes.req.applicationId"
];

const config = {
  childFunTemplate,
  excludeParamName,
  outputPath,
  parentFunTemplate,
  url,
  center: centerName
};

module.exports = config;