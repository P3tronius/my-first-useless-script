<?php

$path1 = '/db/ITSA/LIB';
require_once $path1 . '/DB/DBFactory.php'; //DB.class.php


echo "Childrens code process started at ".date("Y-m-d H:i:s")."\n";

$update = $_SERVER['argv'][1];

$db = DBFactory::connectDB_PV1(); //Connection à la base PV1
$routeById = getRouteById($db);

if(strcmp($update,"true")==0) //S'il y a une mise à jour de codes Planet VoIP pour le lendemain
{
	$today = date("Y-m-d",strtotime("+1 day")); //Date de demain
	$codesAdditionsDeletions = getAdditionsDeletions($db,$today);//Récupération des codes qui prennent effets aujourd'hui dans la table COD
	$codesBlocked = getCodeBlocked($db);//Récupération des codes blocked dans la table Master_Code_List

	if(empty($codesAdditionsDeletions)) //S'il n'y a pas d'additions et de deletions on arrête le processus
	{
		echo "Childrens code process ended at ".date("Y-m-d H:i:s")."\n";
		exit(0);
	}

	foreach($codesAdditionsDeletions as $data) //Traitement des codes en additions et deletions
	{
		list($routeid,$code) = $data;
		echo "routeid: " . $routeid . ", code: " . $code . ", destination: " . $routeById[$routeid] . PHP_EOL;

		foreach($codesBlocked as $codeBlocked=>$routeIdBlocked)
		{
			$length = strlen($codeBlocked);
			if(strcmp(substr($code,0,$length),$codeBlocked)==0) //Si le code appartient au code blocked
			{
				$saveBlocked[$codeBlocked] = $routeIdBlocked; //Sauvegarde le code bloked

				echo "routeIdBlocked: " . $routeIdBlocked . ", codeBlocked: " . $codeBlocked . ", ".
				"destination: " . $routeById[$routeIdBlocked] . PHP_EOL;
				break;
			}
			unset($routeIdBlocked);
		}
		unset($data);
	}
	echo "------------------------------" . PHP_EOL;

	$codesMCL = getMCL($db,$saveBlocked); //Récupération des codes dans la table Master_Code_List en fonction des codes blocked définit
	echo "TRAITEMENT CODE MCL: " . PHP_EOL;
	foreach($codesMCL as $code=>$routeid)
	{
		echo "code: " . $code . ", routeid: " . $routeid . ", destination: " . $routeById[$routeid] . PHP_EOL;
		unset($routeid);
	}
	echo "------------------------------" . PHP_EOL;
}
else if(strcmp($update,"false")==0)
{
	$codesMCL = getMCL($db); //Récupération de tous les codes dans la table Master_Code_List
}

$childrensCodes = array();
$test = array(); //A verifier mais je pense que l'on peut supprimer cette variable dans le code
$save = array();
$decomp = array();

foreach($codesMCL as $code=>$routeid)
{
	//echo '$code : ' . $code . '<BR/>';
	$childrens = getChildrensCodes($db,$code,$save); //Récupère les codes enfants pour ce code dans la table Master_Code_List
	//print_r($childrens);

	foreach($childrens as $index=>$cc)
	{
		if(count($cc)>1 || count($childrens)>1)
		{
			for($i=0; $i<=9; $i++)
			{
				$newCode = $index.$i." ";//décomposition
				$search = substr(trim($newCode),0,strlen(trim($newCode))-1)." ";

				//Si je décompose 5671 en 56710,56711,56712,56713,56714... alors pas besoin de 5671
				if(isset($childrensCodes[$code][$routeid]))
				{
					foreach($childrensCodes[$code][$routeid] as $childs)
					{
						$childs = trim($childs);
						$search = substr(trim($newCode),0,strlen($childs));

						if(strcmp($childs,$search)==0 && strlen($childs) < strlen(trim($newCode)))
						{
							$key = array_search($search." ",$childrensCodes[$code][$routeid]);
							unset($childrensCodes[$code][$routeid][$key]);

							for($j=0; $j<=9; $j++)
							{
								$newCode2 = $search.$j." ";

								if(!isset($childrensCodes[$code][$routeid]) && !in_array(trim($newCode2),$cc))
								{
									$childrensCodes[$code][$routeid][] = $newCode2;
									$save[$code][] = $newCode2;
								}
								else if(isset($childrensCodes[$code][$routeid]) 
								&& !in_array($newCode2,$childrensCodes[$code][$routeid])
								&& (!in_array(trim($newCode2),$cc)))
								{
									$childrensCodes[$code][$routeid][] = $newCode2;
									$save[$code][] = $newCode2;
								}
							}
						}
					}
				}

				if(!isset($childrensCodes[$code][$routeid]) && !in_array(trim($newCode),$cc))
				{
					$childrensCodes[$code][$routeid][] = $newCode;
					$save[$code][] = $newCode;

					if(!in_array($newCode." cc",$test))
					{
						$test[] = $newCode." cc";
					}
				}
				else if(isset($childrensCodes[$code][$routeid]) && !in_array($newCode,$childrensCodes[$code][$routeid]) 
				&& (!in_array(trim($newCode),$cc)))
				{
					$childrensCodes[$code][$routeid][] = $newCode;
					$save[$code][] = $newCode;

					if(!in_array($newCode." cc",$test))
					{
						$test[] = $newCode." cc";
					}
				}
			}
		}
		else
		{
			$notCC[$routeid][$code] = $code;
		}
	}

	if(empty($childrens))
	{
		$notCC[$routeid][$code] = $code;
	}
}

if(strcmp($update,"true")==0)
{
	foreach($saveBlocked as $codeBlocked=>$routeIdBlocked)
	{
		$sql = "delete from test.TEST_RouteingCodeList where code like \"" . $codeBlocked . "%\"";
		//echo $sql . PHP_EOL;
		$db->exec($sql);
		unset($routeIdBlocked);
	}
	unset($save);
}
else
{
	$sql = "delete from test.TEST_RouteingCodeList";
	//echo $sql . PHP_EOL;
	$db->exec($sql);
}

echo "------------------------------" . PHP_EOL . '<BR/>';

//$arrayParentCode;

foreach($childrensCodes as $parentCode=>$datas)
{
	foreach($datas as $routeid=>$data)
	{
		echo $parentCode . " ----> " . $routeById[$routeid] . "(" . $routeid . ") ";
		asort($data);

		//$arrayParentCode[] = $parentCode;
	
		foreach($data as $value)
		{
			//if(empty($arrayParentCode[trim($value)]))
			//{
				echo $value . " / ";
				$sql = "insert into test.TEST_RouteingCodeList values ('".trim($value)."','$routeid',NULL);";
				//echo $sql . PHP_EOL;
				$db->exec($sql);
			//}
		}
		echo PHP_EOL . '<BR/>';
	}
	echo "------------------------------" . PHP_EOL . '<BR/>';
}

echo "INSERT NOT CC" . PHP_EOL;
foreach($notCC as $routeid=>$data)
{
	foreach($data as $value)
	{
		$sql = "insert into test.TEST_RouteingCodeList values ('$value','$routeid',NULL);";
		//echo $sql . PHP_EOL;
		$db->exec($sql);
	}
}

echo "------------------------------" . PHP_EOL . '<BR/>';

//echo 'arrayParentCode' . '<BR/>';
//var_dump($arrayParentCode);
//foreach($arrayParentCode as $code)
//{
//	$sql = "delete from RouteingCodeList where code='$code';";
//	//$result = $db->query($sql);
//}
//echo 'arrayParentCode' . '<BR/>';

echo "Childrens code process ended at ".date("Y-m-d H:i:s")."\n";

//asort($test);
//print_r($test);


//================================================= FUNCTIONS =======================================================================

/**
 * @author Jeremie Alonzeau
 * Retourne le nom des destinations pour chaque routeId
 * @param PDO $db
 * @return Array
 */
function getRouteById($db)
{
	$return = array();

	$sql = "select routeid,destination from PV1.Route_Details";
	$result = $db->query($sql)->fetchAll();

	foreach($result as $value)
	{
		$return[$value['routeid']] = $value['destination'];
		unset($value);
	}
	unset($result);
	return $return;
}

/**
 * @author Jeremie Alonzeau
 * Retourne les changements de codes Planet VoIP
 * @param PDO $db
 * @param Date $date
 * @return Array
 */
function getAdditionsDeletions($db,$date)
{
	$return = array();

	$sql = "SELECT routeId,CAST(code AS CHAR) AS code,FROM_UNIXTIME(dateAdded/1000) as dateAdded," .
	"effectiveDate,type FROM test.TEST_COD WHERE DATE(FROM_UNIXTIME(effectiveDate/1000))='" . $date . "' ORDER BY code";
	//echo $sql . PHP_EOL;
	$result = $db->query($sql)->fetchAll();

	foreach($result as $row)
	{
		$return[] = array($row['routeId'],$row['code']);
	}
	return $return;
}

/**
 * @author Jeremie Alonzeau
 * Retourne les codes Blocked et leurs routeId
 * @param PDO $db
 * @return Array
 */
function getCodeBlocked($db)
{
	$return = array();

	$sql = "select code,mcl.routeid from PV1.Master_Code_List as mcl join PV1.Route_Details as rd ".
	"on mcl.routeid=rd.routeid where destination like '%[Blocked]%' order by code desc";
	//echo $sql . PHP_EOL;
	$result = $db->query($sql)->fetchAll();


	foreach($result as $value)
	{
		$return[$value['code']] = $value['routeid'];
		unset($value);
	}
	return $return;
}

/**
 * @author Jeremie Alonzeau
 * Retourne les codes avec les routeids correspondantes
 * @param PDO $db
 * @param Array $codesBlocked
 * @return Array
 */
function getMCL($db,$codesBlocked=array())
{
	$return = array();

	if(empty($codesBlocked)) //Récupération de tous les codes en ignorant les codes blocked dans la table Master_Code_List
	{
		$sql = "select code,mcl.routeid from PV1.Master_Code_List as mcl join PV1.Route_Details as rd ".
		"on mcl.routeid=rd.routeid order by code desc";
		//"on mcl.routeid=rd.routeid where code like '44%' order by code desc";//Pour test
		
		//"on mcl.routeid=rd.routeid where destination not like '%[Blocked]%' order by code desc";
		echo $sql . PHP_EOL;
		$result = $db->query($sql)->fetchAll();

		foreach($result as $value)
		{
			$return[$value['code']] = $value['routeid'];
			unset($value);
		}
		unset($result);
	}
	else
	{
		//Récupération des codes appartenant aux codes blocked définit dans la variable $codesBlocked dans la Master_Code_List
		foreach($codesBlocked as $codeBlocked=>$routeIdBlocked)
		{
			$sql = "select code,mcl.routeid from PV1.Master_Code_List as mcl join PV1.Route_Details as rd ".
			"on mcl.routeid=rd.routeid where code like \"" . $codeBlocked . "%\"order by code desc";
			//"on mcl.routeid=rd.routeid where destination not like '%[Blocked]%' ".
			//"and code like \"" . $codeBlocked . "%\"order by code desc";
			//echo $sql . PHP_EOL;
			$result = $db->query($sql)->fetchAll();

			foreach($result as $value)
			{
				$return[$value['code']] = $value['routeid'];
				unset($value);
			}
			unset($result);
			unset($routeIdBlocked);
		}
	}
	return $return;
}

/**
 * @author Jeremie Alonzeau
 * Récupère les childrens codes pour le code passé en paramètre dans la table Master_Code_List 
 * @param PDO $db
 * @param string $code
 * @param Array $save
 * @return Array
 */
function getChildrensCodes($db,$code,$save)
{
	$return = array();
	$return2 = array();
	$decomp = array();

	$sql = "select code,routeid,length(code) as size from PV1.Master_Code_List ".
		"where code like \"".$code."%\" order by code asc, length(code) asc;";
	//echo $sql;
	$result = $db->query($sql)->fetchAll();

	foreach($result as $value)
	{
		if(array_key_exists($value['code'],$save)) //Si c'est un code qui a été décomposé, je récupère la décomposition en childrens codes
		{
			//$save[$value['code']] = array_unique($save[$value['code']]);
			foreach($save[$value['code']] as $val)
			{
				$index = substr(trim($val),0,strlen(trim($val))-1);
				$return[$index][] = trim($val);
				$return2[] = $val; //Au cas où Alexandre veut un fichier html
				$decomp[] = $val;
			}
		}
		else
		{
			if(strcmp($value['code'],$code)==0)
			{
				$index = $code;
			}
			else
			{
				$index = substr($value['code'],0,$value['size']-1);
			}
			$return[$index][] = $value['code'];
			$return2[] = $value['code']." "; //Au cas où Alexandre veut un fichier html
		}
		//la fonction array_unique a été ajoutée car il y a vait des doublons lors de la régénération de la RouteingCodeList.
		//$return = array_unique($return);
		//$return2 = array_unique($return2);
		//$decomp = array_unique($decomp);

		unset($value);
	}
	unset($result);

	//Si Alexandre veut un fichier html, il faut décommenter cette partie et renvoyer les logs du script vers un fichier .html
	if(!empty($return2) && (count($return2)>1))
	{
		echo $code . " ---> ";
		asort($return2);
		foreach($return2 as $value)
		{
			if(in_array($value,$decomp))
			{
				echo "<font color='red'>" . $value . "</font> / ";
			}
			else
			{
				echo "<font color='green'>" . $value . "</font> / ";
			}
		}
		//print_r($return2);
		//print_r($decomp);
		echo "<br/>";
		echo "------------------------------<br/>";
	}
	return $return;
}

